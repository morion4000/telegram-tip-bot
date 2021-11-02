const user = require('./../models').user;
const Telegram = require('./../services/telegram');
const {
  check_private_message,
  check_telegram_username,
  find_user_by_id_or_username,
  extract_amount,
} = require('./../utils');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    await check_private_message(msg);
    await check_telegram_username(msg);

    const telegram = new Telegram();

    let amount = await extract_amount(msg);

    const found_user = await find_user_by_id_or_username(
      msg.from.id,
      msg.from.username
    );

    if (amount === null) {
      amount = found_user.balance_lottery;
    }

    if (!found_user) {
      await telegram.send_message(
        msg.chat.id,
        'Your user can not be found. Create a new acount /start',
        Telegram.PARSE_MODE.MARKDOWN,
        true
      );

      return;
    }

    if (found_user.balance_lottery < amount) {
      await telegram.send_message(
        msg.chat.id,
        `You don't have enough balance to withdraw ${amount}. Your lottery balance is ${found_user.balance_lottery}.`,
        Telegram.PARSE_MODE.MARKDOWN,
        true
      );

      return;
    }

    await user.model.update(
      {
        balance_lottery: found_user.balance_lottery - amount,
        balance_lottery_withdraw: found_user.balance_lottery_withdraw + amount,
      },
      {
        where: {
          id: found_user.id,
        },
      }
    );

    await telegram.send_message(
      msg.chat.id,
      `Withdrew ${amount} from lottery balance. The amount will be credited to your /tipbalance when the /lottery rounds ends.`,
      Telegram.PARSE_MODE.MARKDOWN,
      true
    );
  } catch (e) {
    console.error(e);
  }
};
