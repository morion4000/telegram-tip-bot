const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const config = require('./../config');
const { transfer_funds } = require('./../utils');
const numeral = require('numeral');
const paypal = require('@paypal/checkout-server-sdk');
const TelegramBot = require('node-telegram-bot-api');

exports.handler = async function (event) {
  const environment = new paypal.core.LiveEnvironment(
    config.paypal.client_id,
    config.paypal.client_secret
  );
  const client = new paypal.core.PayPalHttpClient(environment);
  const bot = new TelegramBot(config.telegram.token, {
    polling: false,
  });

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

      await transfer_funds(user.telegram_username, transaction.amount);

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

      await bot.sendMessage(
        config.admin.telegram_chat_id,
        `💵 New purchase: @${user.telegram_username} purchased ${numeral(
          transaction.amount
        ).format('0,0')} WEBD`,
        {
          disable_web_page_preview: true,
        }
      );
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
