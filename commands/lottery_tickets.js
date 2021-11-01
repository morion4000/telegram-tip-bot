const user_model = require('./../models').user.model;
const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const { format_number } = require('./../utils');
const config = require('./../config');

const _ = require('underscore');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  const telegram = new Telegram();
  const webdchain = new Webdchain();
  const current_height = await webdchain.get_height();
  const lottery = new Lottery(current_height);

  const round = await lottery.get_last_round();
  const user = await user_model.findOne({
    where: {
      telegram_id: msg.chat.id,
    },
  });
  const tickets = await lottery.get_tickets_for_user_and_round(user, round);
  const tickets_number =
    await lottery.calculate_tickets_number_for_user_and_round(user, round);
  const chance = (tickets_number / round.tickets) * 100;
  let message =
    `🎟 You bought *${format_number(
      tickets_number
    )}* tickets for the current /lottery round.\n` +
    `📈 Chance of winning: *${chance}%*.\n\n`;

  for (const ticket of tickets) {
    message += `▫️ Tickets *${format_number(
      ticket.range_min
    )}* - *${format_number(ticket.range_max)}* bought at ${format_number(
      ticket.price
    )} WEBD / ticket \n`;
  }

  if (tickets.length === 0) {
    message += `🤷‍♂️ You don't have any tickets.`;
  }

  await telegram.send_message(
    msg.chat.id,
    message,
    Telegram.PARSE_MODE.MARKDOWN,
    false
  );
};
