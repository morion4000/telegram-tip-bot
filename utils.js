const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');

const user_model = require('./models').user.model;
const coin_model = require('./models').coin.model;
const config = require('./config');

function format_number(number) {
  return numeral(number).format('0,0');
}

async function convert_to_usd(amount) {
  const webdollar = await coin_model.findOne({
    where: {
      ticker: 'WEBD',
    },
  });

  if (!webdollar) {
    throw new Error('Coin not found');
  }

  return parseFloat(amount * webdollar.price_usd);
}

function get_amount_for_price(price) {
  let amount = 0;

  switch (price) {
    case config.topup.package1.usd:
      amount = config.topup.package1.webd;
      break;

    case config.topup.package2.usd:
      amount = config.topup.package2.webd;
      break;

    case config.topup.package3.usd:
      amount = config.topup.package3.webd;
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

    await bot.sendMessage(user.telegram_id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  } catch (error) {
    console.error(error);
  }
}

// Telegram users can change username
// Make sure we keep it up to date, otherwise accounts can get split
async function update_username(from) {
  if (from && from.username) {
    await user_model.update(
      {
        telegram_username: from.username,
      },
      {
        where: {
          telegram_id: from.id,
        },
        logging: false,
      }
    );

    console.log(`Updated username: ${from.username}`);
  }
}

module.exports = {
  get_amount_for_price,
  transfer_funds,
  update_username,
  format_number,
  convert_to_usd,
};
