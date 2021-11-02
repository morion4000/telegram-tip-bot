const user = require('./../models').user;
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const Telegram = require('./../services/telegram');
const {
  check_private_message,
  check_telegram_username,
  check_and_extract_amount,
  format_number,
  find_user_by_id_or_username,
} = require('./../utils');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    await check_private_message(msg);
    await check_telegram_username(msg);

    const amount = await check_and_extract_amount(msg);
    const telegram = new Telegram();
    const webdchain = new Webdchain();
    const current_height = await webdchain.get_height();
    const lottery = new Lottery(current_height);

    const found_user = await find_user_by_id_or_username(
      msg.from.id,
      msg.from.username
    );

    if (!found_user) {
      await telegram.send_message(
        msg.chat.id,
        'Your user can not be found. Create a new acount /start',
        Telegram.PARSE_MODE.HTML,
        true
      );

      throw new Error('User not found');
    }

    if (found_user.balance < amount) {
      await telegram.send_message(
        msg.chat.id,
        `You don't have enough /tipbalance to deposit ${amount}.`,
        Telegram.PARSE_MODE.HTML,
        true
      );

      throw new Error('Not enough balance');
    }

    await user.model.update(
      {
        balance: found_user.balance - amount,
        balance_lottery: amount,
      },
      {
        where: {
          id: found_user.id,
        },
      }
    );

    const { tickets, price } = await lottery.buy_tickets(found_user, amount);

    const message = `🎟 Bought ${format_number(
      tickets
    )} /lotterytickets for this round (${format_number(
      price
    )} WEBD / ticket).`;

    await telegram.send_message(
      msg.chat.id,
      message,
      Telegram.PARSE_MODE.HTML,
      true
    );
  } catch (e) {
    console.error(e);
  }
};
