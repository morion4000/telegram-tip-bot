const user = require('./../models').user;
const Telegram = require('./../services/telegram');
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

    const activities = activity.get_last_60_minutes(msg.chat, msg.from);
    const messages = activity.get_messages_from_activities(activities);

    if (activities.size === 0) {
      await telegram.send_message(
        msg.chat.id,
        `ℹ️ No active users on the channel in the past hour.`,
        Telegram.PARSE_MODE.MARKDOWN,
        true
      );

      return;
    }

    await telegram.send_message(
      msg.chat.id,
      `💧 Rained *${format_number(amount)} WEBD* ($${format_number(
        amount_usd
      )}) to ${
        activities.size
      } users on the channel (active in the past hour).`,
      Telegram.PARSE_MODE.MARKDOWN
    );

    for (const [key, value] of activities) {
      // TODO: Implement weight?
      const user_amount = Math.floor(amount / activities.size);
      const user_amount_usd = await convert_to_usd(user_amount);

      // TODO: Create service to Tip
      // Find receiving user or create a new one
      // Substract amount
      // Insert tip in db
      // Send telegram messages
      // Etc.
      const _found_user = find_user_by_id_or_username(
        value.user.id,
        value.user.username
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
        `💰 [${
          value.user.username
        }](tg://user?id=${key}) was tipped *${format_number(
          user_amount
        )} WEBD* ($${format_number(user_amount_usd)})`,
        Telegram.PARSE_MODE.MARKDOWN
      );

      await telegram.send_message(
        key,
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
