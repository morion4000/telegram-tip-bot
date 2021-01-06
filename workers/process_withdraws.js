const user_model = require('./../models').user.model;
const transaction_model = require('./../models').transaction.model;
const coin_model = require('./../models').coin.model;
const config = require('./../config');
const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');
const axios = require('axios');
const mailgun = require('mailgun-js')({
  apiKey: config.mailgun.key,
  domain: config.mailgun.domain,
});

const TRANSACTION_FEE = 9;
const MAX_TRIES = 1;
const FROM_ADDRESS = config.vault;
const API_KEY = config.webdollar.node.key;
const URL = config.webdollar.node.url + '/' + API_KEY;

exports.handler = async function (event) {
  const bot = new TelegramBot(config.telegram.token, {
    polling: false,
  });

  const webdollar = await coin_model.findOne({
    where: {
      ticker: 'WEBD',
    },
  });

  if (!webdollar) {
    throw new Error('Coin not found');
  }

  const transactions = await transaction_model.findAll({
    where: {
      type: 'withdraw',
      processed: false,
      deleted: false,
    },
    logging: false,
  });

  console.log('found transactions', transactions.length);

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];

    if (transaction.tries >= MAX_TRIES) {
      console.log(
        'transaction',
        transaction.id,
        'tried',
        transaction.tries,
        'aborting...'
      );

      continue;
    }

    console.log('processing transaction', transaction.id);

    const transaction_to = encodeURIComponent(transaction.transaction_to);
    const url =
      URL +
      '/wallets/create-transaction/' +
      FROM_ADDRESS +
      '/' +
      transaction_to +
      '/' +
      transaction.amount +
      '/' +
      TRANSACTION_FEE;

    console.log('calling', url);

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = response.data;

    if (data.result === true) {
      console.log('sent transaction with nonce', data.transaction.nonce);

      await transaction_model.update(
        {
          extra_data: data.transaction.nonce,
          tries: transaction.tries + 1,
        },
        {
          where: {
            id: transaction.id,
          },
          logging: false,
        }
      );

      const user = await user_model.findOne({
        where: {
          id: transaction.user_id,
        },
        logging: false,
      });

      if (user.telegram_id) {
        const amount_usd = parseFloat(transaction.amount * webdollar.price_usd);
        const resp =
          '🆕 *Update*: Withdraw transaction is being processed. Your wallet `' +
          transaction.transaction_to +
          '` will receive *' +
          numeral(transaction.amount).format('0,0') +
          '* WEBD ($' + numeral(amount_usd).format('0,0') + ').';

        bot
          .sendMessage(user.telegram_id, resp, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    } else {
      console.error('error sending transaction', error, body);

      await mailgun.messages().send({
        from: 'Hostero <no-reply@mg.hostero.eu>',
        to: config.admin.email,
        subject: '[SYSTEM] WITHDRAWAL ERROR - Telegram Tip Bot',
        text: body,
      });
    }
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
