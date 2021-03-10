const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');

const user_model = require('./models').user.model;
const config = require('./config');

function get_amount_for_price(price) {
  let amount = 0;

  switch (price) {
    case 2:
      amount = 10000;
      break;

    case 15:
      amount = 100000;
      break;

    case 120:
      amount = 1000000;
      break;
  }

  return amount;
}

async function transfer_funds(username, amount) {
  try {
    const bot = new TelegramBot(config.telegram.token, {
      polling: false,
    });

    const user = await user_model.findOne({
      where: {
        telegram_username: username,
      },
    });

    if (!user) {
      throw new Error(`username not found: ${username}`);
    }

    const new_balance = user.balance + amount;

    await user_model.update(
      {
        balance: new_balance,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const resp =
      '💰 Your account was credited with *' +
      numeral(amount).format('0,0') +
      '* WEBD from your purchase. Funds in your /tipbalance are receiving /staking rewards.';

    bot.sendMessage(user.telegram_id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  get_amount_for_price,
  transfer_funds,
};
