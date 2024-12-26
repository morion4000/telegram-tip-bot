const moment = require('moment');
const Sequelize = require('sequelize');

const config = require('./../config');
const log_model = require('./../models').log.model;
const user_model = require('./../models').user.model;
const Telegram = require('./../services/telegram');
const { format_number } = require('./../utils');

exports.handler = async function (event) {
  const telegram = new Telegram();
  const rewards = [];
  let amount = 0;

  const logs = await log_model.findAll({
    where: {
      event: 'reward',
      createdAt: {
        [Sequelize.Op.between]: [moment().subtract(1, 'day'), moment()],
      },
    },
    order: [['createdAt', 'DESC']],
    logging: false,
  });

  console.log('found logs', logs.length);

  const users_rewards = logs.reduce((acc, log) => {
    const extra = JSON.parse(log.extra_message);
    const user_id = log.user_id;

    if (!acc[user_id]) {
      acc[user_id] = 0;
    }

    acc[user_id] += extra.new_balance - extra.balance;

    return acc;
  }, {});

  for (const [user_id, user_amount] of Object.entries(users_rewards)) {
    const user = await user_model.findOne({
      where: {
        id: user_id,
      },
      logging: false,
    });
    const user_display_name = user.telegram_username || user.telegram_id;

    amount += user_amount;

    rewards.push({
      amount: user_amount,
      message: `[@${user_display_name}](tg://user?id=${user_id}) got *${format_number(
        user_amount
      )}*`,
    });
  }

  if (amount > 0) {
    const message = `ℹ️ *${
      Object.entries(users_rewards).length
    }* users have played 👻 Haunted Tower in the last 24 hours and received *${format_number(
      amount
    )}* WEBD.`;

    await telegram.send_message(
      config.game.telegram_channel,
      message,
      Telegram.PARSE_MODE.MARKDOWN
    );

    await telegram.send_message(
      config.game.telegram_channel,
      rewards
        .sort((a, b) => a.amount - b.amount)
        .reverse()
        .map((r) => r.message)
        .join(' ▫️ '),
      Telegram.PARSE_MODE.MARKDOWN
    );
  }

  return {
    message: `Found ${logs.length} logs`,
    event,
  };
};
