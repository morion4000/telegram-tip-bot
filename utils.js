const numeral = require('numeral');
const _ = require('underscore');
const Sequelize = require('sequelize');

const Telegram = require('./services/telegram');
const user_model = require('./models').user.model;
const coin_model = require('./models').coin.model;
const config = require('./config');

function format_number(number) {
  // Format number to 2 decimal places if float
  return number % 1 === 0
    ? numeral(number).format('0,0')
    : numeral(number).format('0,0.00');
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

function get_package_for_amount(amount) {
  let pgk = config.topup.package1;

  switch (amount) {
    case config.topup.package1.webd:
      pgk = config.topup.package1;
      break;

    case config.topup.package2.webd:
      pgk = config.topup.package2;
      break;

    case config.topup.package3.webd:
      pgk = config.topup.package3;
      break;
  }

  return pgk;
}

async function transfer_reward(username, amount) {
  const telegram = new Telegram();

  try {
    const user = await user_model.findOne({
      where: {
        telegram_username: username,
      },
    });

    if (!user) {
      throw new Error(`username not found: ${username}`);
    }

    if (user.game_rewards + amount > config.game.max_user_rewards) {
      throw new Error(`rewards limit reached: ${config.game.max_user_rewards}`);
    }

    const new_balance = user.balance + amount;

    await user_model.update(
      {
        balance: new_balance,
        game_rewards: user.game_rewards + amount,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const message =
      '🎮 You were rewarded with *' +
      format_number(amount) +
      '* WEBD from playing 👻 Haunted Tower. Funds in your /tipbalance are receiving /staking rewards.';

    telegram
      .send_message(user.telegram_id, message, Telegram.PARSE_MODE.MARKDOWN)
      .catch(console.error);

    return {
      user,
      new_balance,
      balance: user.balance,
    };
  } catch (error) {
    console.error(error);
  }
}

async function transfer_funds(username, amount, amount_lottery = 0) {
  const telegram = new Telegram();

  try {
    const user = await user_model.findOne({
      where: {
        telegram_username: username,
      },
    });

    if (!user) {
      throw new Error(`username not found: ${username}`);
    }

    const new_balance = user.balance + amount;
    const new_balance_lottery = user.balance_lottery + amount_lottery;

    await user_model.update(
      {
        balance: new_balance,
        balance_lottery: new_balance_lottery,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const message =
      '💰 Your account was credited with *' +
      format_number(amount) +
      '* WEBD from your purchase. Funds in your /tipbalance are receiving /staking rewards.';

    await telegram.send_message(
      user.telegram_id,
      message,
      Telegram.PARSE_MODE.MARKDOWN
    );
  } catch (error) {
    console.error(error);
  }
}

async function transfer_funds_locked(
  username,
  amount,
  amount_lottery = 0,
  locked_period_days = 0
) {
  const telegram = new Telegram();

  try {
    const user = await user_model.findOne({
      where: {
        telegram_username: username,
      },
    });

    if (!user) {
      throw new Error(`username not found: ${username}`);
    }

    const new_balance = user.balance_locked + amount;
    const new_balance_lottery = user.balance_lottery + amount_lottery;

    await user_model.update(
      {
        balance_locked: new_balance,
        balance_lottery: new_balance_lottery,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const message =
      '💰 Your /tipbalance was credited with *' +
      format_number(amount) +
      '* WEBD from your purchase. The funds are locked for ' +
      locked_period_days +
      ' day(s).';

    await telegram.send_message(
      user.telegram_id,
      message,
      Telegram.PARSE_MODE.MARKDOWN
    );
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

    console.log(`Updated username: ${from.username} (${from.id})`);
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
      'ℹ️ Private command. Please message @webdollar_tip_bot to use the command.',
      Telegram.PARSE_MODE.HTML,
      true
    );

    throw new Error('Private command');
  }
}

async function check_public_message(msg) {
  const telegram = new Telegram();

  if (msg.chat.type === 'private') {
    await telegram.send_message(
      msg.chat.id,
      'ℹ️ Public command. Please use the command in a channel or group.',
      Telegram.PARSE_MODE.HTML,
      true
    );

    throw new Error('Public command');
  }
}

async function check_telegram_username(msg) {
  const telegram = new Telegram();

  if (!msg.from.username) {
    await telegram.send_message(
      msg.chat.id,
      'ℹ️ Please set an username for your telegram account to use the bot.',
      Telegram.PARSE_MODE.HTML,
      true
    );

    throw new Error('No username');
  }
}

function extract_amount(msg, index = 0) {
  const amount_match = msg.text.match(/ [0-9]+/g);

  if (amount_match === null) {
    return null;
  }

  let amount = amount_match.length >= index ? amount_match[index] : null;

  if (_.isString(amount)) {
    amount = amount.trim();
  }

  amount = parseInt(amount);

  return amount;
}

async function check_and_extract_amount(msg, extra_msg) {
  const telegram = new Telegram();
  const amount = extract_amount(msg);
  let message = 'ℹ️ You need to specify the amount.';

  // TODO: Check this logic
  if (amount === null) {
    if (extra_msg) {
      message += ' Example: `' + extra_msg + ' 100`';
    }

    await telegram.send_message(
      msg.chat.id,
      message,
      Telegram.PARSE_MODE.MARKDOWN,
      true
    );

    throw new Error('No amount');
  }

  return amount;
}

function find_user_by_id_or_username(id, username) {
  return user_model.findOne({
    where: {
      [Sequelize.Op.or]: [
        {
          telegram_id: id,
        },
        {
          telegram_username: username,
        },
      ],
    },
  });
}

function array_chunks(array, chunk_size) {
  return Array(Math.ceil(array.length / chunk_size))
    .fill()
    .map((_, index) => index * chunk_size)
    .map((begin) => array.slice(begin, begin + chunk_size));
}

module.exports = {
  get_amount_for_price,
  get_package_for_amount,
  transfer_reward,
  transfer_funds,
  transfer_funds_locked,
  update_username,
  format_number,
  convert_to_usd,
  check_private_message,
  check_public_message,
  check_telegram_username,
  check_and_extract_amount,
  extract_amount,
  find_user_by_id_or_username,
  array_chunks,
};
