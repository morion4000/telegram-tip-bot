const user_model = require('./../models').user.model;
const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const { format_number, convert_to_usd } = require('./../utils');
const config = require('./../config');

const _ = require('underscore');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  const telegram = new Telegram();
  const webdchain = new Webdchain();
  const current_height = await webdchain.get_height();
  const lottery = new Lottery(current_height);

  const round = await lottery.get_last_round();
  const participants = await lottery.get_participants(round);
  const tickets_number = await lottery.calculate_tickets_number_for_round(round);
  const prize_usd = await convert_to_usd(round.prize);
  const days_until_next_round = await lottery.calculate_days_until_next_round(
    round
  );

  const message =
    `🎲 Prize: *${format_number(round.prize)} WEBD* ($${format_number(
      prize_usd
    )}).\n` +
    `👥 Participants: *${format_number(participants.length)}*.\n` +
    `🎟 Tickets: *${format_number(tickets_number)}*.\n` +
    `📅 Ends in *${days_until_next_round}* days.`;

  await telegram.send_message(
    msg.chat.id,
    message,
    Telegram.PARSE_MODE.MARKDOWN,
    false
  );
};
