const moment = require('moment');

const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const Telegram = require('./../services/telegram');
const { format_number, get_package_for_amount } = require('./../utils');

exports.handler = async function (event) {
  const telegram = new Telegram();

  const transactions = await transaction_model.findAll({
    where: {
      type: 'purchase',
      locked: true,
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

      const { locked_period_days } = get_package_for_amount(transaction.amount);
      const unlock_date = moment(transaction.createdAt).add(
        locked_period_days,
        'days'
      );

      if (moment().isAfter(unlock_date)) {
        console.log(`unlocking transaction ${transaction.id}`);

        await transaction_model.update(
          {
            locked: false,
          },
          {
            where: {
              id: transaction.id,
            },
            logging: false,
          }
        );

        await user_model.update(
          {
            balance: user.balance + transaction.amount,
            balance_locked: user.balance_locked - transaction.amount,
          },
          {
            where: {
              id: user.id,
            },
            logging: false,
          }
        );

        await telegram.send_message(
          user.telegram_id,
          `🔓 Your funds: ${format_number(
            transaction.amount
          )} WEBD where unlocked and added to your /tipbalance.`
        );
      }
    } catch (error) {
      console.error(error.message || error);
    }
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
