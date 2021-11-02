const user_model = require('./../models').user.model;
const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const {
  check_private_message,
  check_telegram_username,
  format_number,
  find_user_by_id_or_username,
} = require('./../utils');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    await check_private_message(msg);
    await check_telegram_username(msg);

    const telegram = new Telegram();
    const webdchain = new Webdchain();
    const current_height = await webdchain.get_height();
    const lottery = new Lottery(current_height);

    const round = await lottery.get_last_round();
    const user = await find_user_by_id_or_username(
      msg.from.id,
      msg.from.username
    );
    const tickets = await lottery.get_tickets_for_user_and_round(user, round);
    const tickets_number =
      await lottery.calculate_tickets_number_for_user_and_round(user, round);
    const chance = (tickets_number / round.tickets) * 100;
    let message = `🎟 You have *${format_number(
      tickets_number
    )}* tickets for the current /lottery round:\n\n`;

    for (const ticket of tickets) {
      message += `▫️ *${format_number(ticket.range_min)}* - *${format_number(
        ticket.range_max
      )}*\n`;
    }

    if (tickets.length === 0) {
      message += `🤷‍♂️ No tickets.`;
    }

    message += `\n📈 Chance of winning: *${chance}%*.`;
    // message += `\n💵 Cost of tickets: *${format_number(
    //   user.balance_lottery
    // )} WEBD*.`;

    await telegram.send_message(
      msg.chat.id,
      message,
      Telegram.PARSE_MODE.MARKDOWN,
      true
    );
  } catch (e) {
    console.log(e);
  }
};
