const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');
const _  = require('underscore');

const Telegram = require('./services/telegram');
const user_model = require('./models').user.model;
const coin_model = require('./models').coin.model;
const config = require('./config');

function format_number(number) {
  // Format number to 1 decimal places if float
  return number % 1 === 0
    ? numeral(number).format('0,0')
    : numeral(number).format('0,0.0');
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

async function check_private_message(msg) {
  const telegram = new Telegram();

  if (
    msg.chat.type !== 'private' &&
    !config.public_channels.includes(msg.chat.id)
  ) {
    await telegram.send_message(
      msg.chat.id,
      'Private command. Please DM the bot: @webdollar_tip_bot to use the command.',
      Telegram.PARSE_MODE.MARKDOWN,
      false
    );

    throw new Error('Private command');
  }
}

async function check_telegram_username(msg) {
  const telegram = new Telegram();

  if (!msg.from.username) {
    await telegram.send_message(
      msg.chat.id,
      'Please set an username for your telegram account to use the bot.',
      Telegram.PARSE_MODE.MARKDOWN,
      false
    );

    throw new Error('No username');
  }
}

async function check_and_extract_amount(msg) {
  const telegram = new Telegram();
  const amount_match = msg.text.match(/ [0-9]+/);

  if (amount_match === null) {
    await telegram.send_message(
      msg.chat.id,
      'Please specify an amount',
      Telegram.PARSE_MODE.MARKDOWN,
      false
    );

    throw new Error('No amount');
  }

  let amount = amount_match[0];

  if (_.isString(amount)) {
    amount = amount.trim();
  }

  amount = parseInt(amount);

  return amount;
}

module.exports = {
  get_amount_for_price,
  transfer_funds,
  update_username,
  format_number,
  convert_to_usd,
  check_private_message,
  check_telegram_username,
  check_and_extract_amount,
};
