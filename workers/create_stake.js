const user_model = require('./../models').user.model;
const log_model = require('./../models').log.model;
const coin_model = require('./../models').coin.model;
const config = require('./../config');
const moment = require('moment');
const numeral = require('numeral');
const TelegramBot = require('node-telegram-bot-api');

async function has_ran_recently() {
  const logs = await log_model.findAll({
    where: {
      event: 'staking',
    },
    limit: 1,
    order: [['createdAt', 'DESC']],
    logging: false,
  });

  const last_log = logs[0];
  const now = moment(new Date());
  const end = moment(last_log.createdAt);
  const delta = now.diff(end, 'hours');

  if (delta <= 3) {
    return true;
  } else {
    return false;
  }
}

exports.handler = async function (event) {
  const bot = new TelegramBot(config.telegram.token, {
    polling: false,
  });

  let total_stake = 0;

  // Avoid running multiple times in the same day
  if (await has_ran_recently()) {
    console.log('closing, ran recently');

    return;
  }

  const webdollar = await coin_model.findOne({
    where: {
      ticker: 'WEBD',
    },
  });

  if (!webdollar) {
    throw new Error('Coin not found');
  }

  const users = await user_model.findAll({
    logging: false,
  });

  console.log('found users', users.length);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // if (user.telegram_id !== '528354447') {
    //   continue;
    // }

    if (!user.telegram_id) {
      continue;
    }

    if (user.balance < config.staking.threshold) {
      continue;
    }

    const stake = Math.floor(
      (user.balance * config.staking.yearly_percentage) / 100 / 360
    );
    const new_balance = user.balance + stake;
    const stake_usd = parseFloat(stake * webdollar.price_usd);
    const new_balance_usd = parseFloat(new_balance * webdollar.price_usd);

    total_stake += stake;

    if (stake === 0) {
      continue;
    }

    console.log(
      'staking',
      stake,
      user.telegram_username,
      'percentage',
      config.staking.yearly_percentage,
      'balance',
      user.balance
    );

    await log_model.create(
      {
        user_id: user.id,
        event: 'staking',
        message: 'New staking reward',
        extra_message: JSON.stringify({
          old_balance: user.balance,
          new_balance: new_balance,
          new_balance_usd: new_balance_usd,
          price_usd: webdollar.price_usd,
          reward: stake,
          reward_usd: stake_usd,
          monthly_percentage: config.staking.yearly_percentage / 12, // legacy
          yearly_percentage: config.staking.yearly_percentage,
        }),
        source: 'workers.create_stake',
      },
      {
        logging: false,
      }
    );

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

    const resp = `💰 New /staking reward: *${numeral(stake).format(
      '0,0'
    )}* WEBD ($${numeral(stake_usd).format(
      '0,0.00'
    )}). Your /tipbalance is: *${numeral(new_balance).format(
      '0,0'
    )}* WEBD. ($${numeral(new_balance_usd).format('0,0.00')})`;

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

  console.log('total stake', total_stake);

  return {
    message: `Total stake ${total_stake}`,
    event,
  };
};
