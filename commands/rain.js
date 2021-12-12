const user = require('./../models').user;
const Telegram = require('./../services/telegram');
const {
  Activity,
  DEFAULT_ACTIVITY_INTERVAL_MINUTES,
} = require('./../services/activity');
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
    const activity = new Activity();

    const found_user = await find_user_by_id_or_username(
      msg.from.id,
      msg.from.username
    );

    if (!found_user) {
      await telegram.send_message(
        msg.chat.id,
        'ℹ️ Your user can not be found. Create a new acount /start',
        Telegram.PARSE_MODE.HTML,
        true
      );

      throw new Error('User not found');
    }

    if (found_user.balance < amount) {
      await telegram.send_message(
        msg.chat.id,
        `ℹ️ You don't have enough /tipbalance to rain ${amount}.`,
        Telegram.PARSE_MODE.HTML,
        true
      );

      throw new Error('Not enough balance');
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

    // Remove after testing
    //activity.add(msg.chat.id, msg.from.id);
    //activity.add(msg.chat.id, '24242424242');

    if (activity.size === 0) {
      await telegram.send_message(
        msg.chat.id,
        `ℹ️ No active users on the channel in the past ${DEFAULT_ACTIVITY_INTERVAL_MINUTES} minutes.`,
        Telegram.PARSE_MODE.MARKDOWN,
        true
      );

      return;
    }

    const grouped_activities =
      activity.get_activities_for_channel_grouped_by_user(msg.chat.id);
    const activities = activity.get_activities_for_channel(msg.chat.id);
    // TODO: group_activities_by_user
    const users = Object.keys(grouped_activities).length;

    await telegram.send_message(
      msg.chat.id,
      `💧 Rained *${format_number(amount)}* WEBD ($${format_number(
        amount_usd
      )}) to ${users} users on the channel (active in the past ${DEFAULT_ACTIVITY_INTERVAL_MINUTES} minutes):`,
      Telegram.PARSE_MODE.MARKDOWN
    );

    for (const [user_id, _activities] of Object.entries(grouped_activities)) {
      const user_percentage = (_activities.length / activities.length) * 100;
      const user_amount = Math.floor((user_percentage * amount) / 100);
      const user_amount_usd = await convert_to_usd(user_amount);

      // TODO: Create service to Tip
      // Find receiving user or create a new one
      // Substract amount
      // Insert tip in db
      const _found_user = await find_user_by_id_or_username(
        user_id,
        'not_implemented_!!!'
      );

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

      await telegram.send_message(
        msg.chat.id,
        `💰 [@${
          _found_user.telegram_username
        }](tg://user?id=${user_id}) received *${format_number(
          user_amount
        )}* WEBD ($${format_number(user_amount_usd)})`,
        Telegram.PARSE_MODE.MARKDOWN
      );

      await telegram.send_message(
        user_id,
        `💰 You were tipped *${format_number(
          user_amount
        )} WEBD* ($${format_number(user_amount_usd)}) by @${msg.from.username}`,
        Telegram.PARSE_MODE.MARKDOWN
      );
    }
  } catch (e) {
    console.error(e);
  }
};
