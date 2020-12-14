const user_model = require('./../models').user.model;
const log_model = require('./../models').log.model;
const config = require('./../config');
const moment = require('moment');

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
  let total_stake = 0;

  // Avoid running multiple times in the same day
  if (await has_ran_recently()) {
    console.log('closing, ran recently');
  }

  const users = await user_model.findAll({
    logging: false,
  });

  console.log('found users', users.length);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (!user.telegram_id) {
      continue;
    }

    let yearly_percentage = 0;

    if (user.balance >= config.staking.tier3_threshold) {
      yearly_percentage = config.staking.yearly_percentage_tier3;
    } else if (user.balance >= config.staking.tier2_threshold) {
      yearly_percentage = config.staking.yearly_percentage_tier2;
    } else if (user.balance >= config.staking.tier1_threshold) {
      yearly_percentage = config.staking.yearly_percentage_tier1;
    }

    const stake = Math.floor((user.balance * yearly_percentage) / 100 / 360);

    total_stake += stake;

    if (stake === 0) {
      continue;
    }

    console.log(
      'staking',
      stake,
      user.telegram_username,
      'percentage',
      yearly_percentage,
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
          new_balance: user.balance + stake,
          reward: stake,
          monthly_percentage: yearly_percentage / 12, // legacy
          yearly_percentage: yearly_percentage,
        }),
        source: 'workers.create_stake',
      },
      {
        logging: false,
      }
    );

    await user_model.update(
      {
        balance: user.balance + stake,
      },
      {
        where: {
          id: user.id,
        },
        logging: false,
      }
    );
  }

  console.log('total stake', total_stake);

  return {
    message: `Total stake ${total_stake}`,
    event,
  };
};
