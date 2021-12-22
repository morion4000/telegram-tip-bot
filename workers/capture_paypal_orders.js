const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const config = require('./../config');
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const Telegram = require('./../services/telegram');
const {
  transfer_funds,
  format_number,
  get_package_for_amount,
} = require('./../utils');
const paypal = require('@paypal/checkout-server-sdk');

exports.handler = async function (event) {
  const environment = new paypal.core.LiveEnvironment(
    config.paypal.client_id,
    config.paypal.client_secret
  );
  const client = new paypal.core.PayPalHttpClient(environment);
  const telegram = new Telegram();
  const webdchain = new Webdchain();
  const current_height = await webdchain.get_height();
  const lottery = new Lottery(current_height);

  const transactions = await transaction_model.findAll({
    where: {
      type: 'purchase',
      processed: false,
      deleted: false,
    },
    logging: false,
  });

  console.log('found transactions', transactions.length);

  for (const transaction of transactions) {
    console.log('processing transaction', transaction.id);

    try {
      const user = await user_model.findOne({
        where: {
          id: transaction.user_id,
        },
        logging: false,
      });

      if (!user) {
        throw new Error(
          `user not found with wallet ${transaction.transaction_from}`
        );
      }

      const request = new paypal.orders.OrdersCaptureRequest(
        transaction.extra_data
      );
      request.requestBody({});
      // Call API with your client and get a response for your call
      const response = await client.execute(request);

      console.log(`Response: ${JSON.stringify(response)}`);
      // If call returns body in response, you can get the deserialized version from the result attribute of the response.
      console.log(`Capture: ${JSON.stringify(response.result)}`);

      const { bonus_lottery } = get_package_for_amount(transaction.amount);

      await transfer_funds(
        user.telegram_username,
        transaction.amount,
        bonus_lottery
      );

      const { tickets, price } = await lottery.buy_tickets(
        user,
        user.balance_lottery
      );

      await transaction_model.update(
        {
          processed: true,
        },
        {
          where: {
            id: transaction.id,
          },
          logging: false,
        }
      );

      telegram
        .send_message(
          config.admin.telegram_chat_id,
          `💵 New purchase: @${
            user.telegram_username
          } purchased ${format_number(transaction.amount)} WEBD`
        )
        .catch(console.error);

      telegram
        .send_message(
          user.telegram_id,
          `🎁 You received ${format_number(
            tickets
          )} /lotterytickets as a bonus for your purchase (${format_number(
            price
          )} WEBD / ticket).`
        )
        .catch(console.error);
    } catch (error) {
      console.error(error.message || error);

      await transaction_model.update(
        {
          tries: transaction.tries++,
        },
        {
          where: {
            id: transaction.id,
          },
          logging: false,
        }
      );
    }
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
