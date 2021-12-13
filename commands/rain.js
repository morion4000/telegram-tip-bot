const user = require('./../models').user;
const Telegram = require('./../services/telegram');
const { DEFAULT_ACTIVITY_INTERVAL_MINUTES } = require('./../services/activity');
const config = require('./../config');
const {
  check_public_message,
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
    const telegram = new Telegram();
    let message = [];

    const found_user = await find_user_by_id_or_username(
      msg.from.id,
      msg.from.username
    );

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
    // activity.add(msg.chat.id, msg.from.id, msg.from.username);
    // activity.add(msg.chat.id, '12222', 'testing123455');

    const grouped_activities =
      activity.get_activities_for_channel_grouped_by_user(msg.chat.id);
    const activities = activity.get_activities_for_channel(msg.chat.id);
    const users = Object.keys(grouped_activities).length;

    if (activities.length === 0) {
      await telegram.send_message(
        msg.chat.id,
        `ℹ️ No active users on the channel in the past *${DEFAULT_ACTIVITY_INTERVAL_MINUTES}* minutes.`,
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
      `💧 @${msg.from.username} rained *${format_number(
        amount
      )}* WEBD ($${format_number(
        amount_usd
      )}) to *${users}* users on the channel (active in the past *${DEFAULT_ACTIVITY_INTERVAL_MINUTES}* minutes).`,
      Telegram.PARSE_MODE.MARKDOWN
    );

    for (const [user_id, user_activities] of Object.entries(
      grouped_activities
    )) {
      const user_percentage =
        (user_activities.length / activities.length) * 100;
      const user_amount = Math.floor((user_percentage * amount) / 100);
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

      // await telegram.send_message(
      //   msg.chat.id,
      //   `💰 [@${user_display_name}](tg://user?id=${user_id}) received *${format_number(
      //     user_amount
      //   )}* WEBD ($${format_number(user_amount_usd)})`,
      //   Telegram.PARSE_MODE.MARKDOWN
      // );

      message.push(
        `[@${user_display_name}](tg://user?id=${user_id}) got *${format_number(
          user_amount
        )}* WEBD`
      );

      const private_message = `💰 You were tipped *${format_number(
        user_amount
      )}* WEBD ($${format_number(user_amount_usd)}) by @${msg.from.username}`;

      // Call will likely fail for users that blocked the bot
      telegram
        .send_message(user_id, private_message, Telegram.PARSE_MODE.MARKDOWN)
        .catch((error) => {
          console.debug(private_message);
          console.error(error);
        });

      // TODO: Insert tip in db
    }

    if (message.length) {
      await telegram.send_message(
        msg.chat.id,
        message.join(' ▫️ '),
        Telegram.PARSE_MODE.MARKDOWN
      );
    }
  } catch (e) {
    console.error(e);
  }
};
