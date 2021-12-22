const user = require('./../models').user;
const tip = require('./../models').tip;
const Telegram = require('./../services/telegram');
const { DEFAULT_ACTIVITY_INTERVAL_MINUTES } = require('./../services/activity');
const config = require('./../config');
const {
  check_public_message,
  extract_amount,
  check_and_extract_amount,
  format_number,
  find_user_by_id_or_username,
  convert_to_usd,
} = require('./../utils');

module.exports = (bot, activity) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    await check_public_message(msg);

    const amount = await check_and_extract_amount(msg, '/rain');
    const amount_usd = await convert_to_usd(amount);
    const duration = extract_amount(msg, 1);
    const duration_minutes = duration
      ? duration * 60
      : DEFAULT_ACTIVITY_INTERVAL_MINUTES;
    const telegram = new Telegram();
    let rewards = [];

    const found_user = await find_user_by_id_or_username(
      msg.from.id,
      msg.from.username
    );

    if (duration > 12) {
      await telegram.send_message(
        msg.chat.id,
        'ℹ️ Duration cannot exceed 12 hours',
        Telegram.PARSE_MODE.HTML
      );

      throw new Error('Amount less than 10');
    }

    if (amount < 100) {
      await telegram.send_message(
        msg.chat.id,
        'ℹ️ Amount must be at least 100 WEBD',
        Telegram.PARSE_MODE.HTML
      );

      throw new Error('Amount less than 100');
    }

    if (!found_user) {
      await telegram.send_message(
        msg.chat.id,
        'ℹ️ Your user can not be found. Create a new acount /start',
        Telegram.PARSE_MODE.HTML
      );

      throw new Error('User not found');
    }

    if (found_user.balance < amount) {
      await telegram.send_message(
        msg.chat.id,
        `ℹ️ You don't have enough /tipbalance to rain ${amount}.`,
        Telegram.PARSE_MODE.HTML
      );

      throw new Error('Not enough balance');
    }

    // Testing
    // activity.add(msg.chat.id, msg.from.id, msg.from.username, 1);
    // activity.add(msg.chat.id, '12221', 'testing123453', 3);
    // activity.add(msg.chat.id, '12221', 'testing123453', 5);
    // activity.add(msg.chat.id, '12222', 'testing123455', 7);

    const grouped_activities =
      activity.get_activities_for_channel_grouped_by_user(
        msg.chat.id,
        msg.from.id,
        duration_minutes
      );
    const activities = activity.get_activities_for_channel(
      msg.chat.id,
      msg.from.id,
      duration_minutes
    );
    const users = Object.keys(grouped_activities).length;
    const total_score = activities.reduce(
      (acc, cur) => acc + cur.message_size,
      0
    );

    if (activities.length === 0) {
      await telegram.send_message(
        msg.chat.id,
        `ℹ️ No active users on the channel in the past *${
          duration_minutes / 60
        }* hours or bot doesn't have access to messages.`,
        Telegram.PARSE_MODE.MARKDOWN
      );

      return;
    }

    await user.model.update(
      {
        balance: found_user.balance - amount,
      },
      {
        where: {
          id: found_user.id,
        },
      }
    );

    await telegram.send_message(
      msg.chat.id,
      `💦 [@${msg.from.username}](tg://user?id=${
        msg.from.id
      }) rained *${format_number(amount)}* WEBD ($${format_number(
        amount_usd
      )}) to *${users}* users active in the past *${
        duration_minutes / 60
      }* hour(s).`,
      Telegram.PARSE_MODE.MARKDOWN
    );

    for (const [user_id, user_activities] of Object.entries(
      grouped_activities
    )) {
      const user_score = user_activities.reduce(
        (acc, cur) => acc + cur.message_size,
        0
      );
      //const user_percentage = (user_score / total_score) * 100;
      const user_percentage =
        (user_activities.length / activities.length) * 100;
      const user_amount = Math.floor((user_percentage * amount) / 100) || 1;
      const user_amount_usd = await convert_to_usd(user_amount);
      const user_name = user_activities.length
        ? user_activities[0].user_name
        : null;
      const user_display_name = user_name || user_id;

      const find_or_create = await user.model.findOrCreate({
        where: {
          telegram_id: user_id,
        },
        defaults: {
          telegram_id: user_id,
          telegram_username: user_name,
          balance: config.initial_balance,
        },
      });

      const _found_user = find_or_create.length ? find_or_create[0] : null;

      if (!_found_user) {
        continue;
      }

      await user.model.update(
        {
          balance: _found_user.balance + user_amount,
        },
        {
          where: {
            id: _found_user.id,
          },
        }
      );

      await tip.model.create({
        amount: user_amount,
        private: false,
        rain: true,
        telegram_id: msg.chat.id,
        telegram_message_id: msg.message_id,
        telegram_chat_id: msg.chat.id,
        telegram_text: msg.text,
        from_user: found_user.id,
        to_user: _found_user.id,
      });

      // await telegram.send_message(
      //   msg.chat.id,
      //   `💰 [@${user_display_name}](tg://user?id=${user_id}) received *${format_number(
      //     user_amount
      //   )}* WEBD ($${format_number(user_amount_usd)})`,
      //   Telegram.PARSE_MODE.MARKDOWN
      // );

      rewards.push({
        amount: user_amount,
        message: `[@${user_display_name}](tg://user?id=${user_id}) got *${format_number(
          user_amount
        )}*`,
      });

      const private_message = `💦 You were rained *${format_number(
        user_amount
      )}* WEBD ($${format_number(user_amount_usd)}) by [@${
        msg.from.username
      }](tg://user?id=${msg.from.id}). You can add more funds using /topup.`;

      // Call will likely fail for users that blocked the bot
      telegram
        .send_message(user_id, private_message, Telegram.PARSE_MODE.MARKDOWN)
        .catch((error) => {
          console.debug(private_message);
          console.error(error.message);
        });
    }

    if (rewards.length) {
      telegram
        .send_message(
          msg.chat.id,
          rewards
            .sort((a, b) => a.amount - b.amount)
            .reverse()
            .map((r) => r.message)
            .join(' ▫️ '),
          Telegram.PARSE_MODE.MARKDOWN
        )
        .catch((error) => {
          console.debug(JSON.stringify(message));
          console.error(error.message);
        });
    }
  } catch (e) {
    console.error(e);
  }
};
