const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const config = require('./../config');
const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');

exports.handler = async function (event) {
  const bot = new TelegramBot(config.telegram.token, {
    polling: false,
  });

  const transactions = await transaction_model.findAll({
    where: {
      type: 'deposit',
      processed: false,
    },
    logging: false,
  });

  console.log('found transactions', transactions.length);

  for (var i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];

    console.log('processing transaction', transaction.id);

    const user = await user_model.findOne({
      where: {
        wallet: transaction.transaction_from,
      },
      logging: false,
    });

    if (!user) {
      console.log('user not found with wallet', transaction.transaction_from);

      continue;
    }

    const new_balance = user.balance + transaction.amount;

    console.log('crediting', user.id, 'with', transaction.amount);

    await user_model.update(
      {
        balance: new_balance,
      },
      {
        where: {
          id: user.id,
        },
        logging: false,
      }
    );

    await transaction_model.update(
      {
        user_id: user.id,
        processed: true,
      },
      {
        where: {
          id: transaction.id,
        },
        logging: false,
      }
    );

    if (user.telegram_id) {
      const resp =
        '🆕 *Update*: Your account was credited with ' +
        numeral(transaction.amount).format('0,0') +
        ' WEBD. Funds in your /tipbalance are receiving /staking rewards.';

      await bot.sendMessage(user.telegram_id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
