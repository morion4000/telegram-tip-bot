const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const { format_number, convert_to_usd } = require('./../utils');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    const webdchain = new Webdchain();
    const current_height = await webdchain.get_height();
    const lottery = new Lottery(current_height);

    const round = await lottery.get_last_round();
    const participants = await lottery.get_participants(round);
    const tickets_number = round.tickets;
    const prize_usd = await convert_to_usd(round.prize);
    const days_until_next_round = await lottery.calculate_days_until_next_round(
      round
    );
    const price = await lottery.calculate_ticket_price(days_until_next_round);

    // TODO: add start / end dates to weekly round
    const message =
      `🎲 *Weekly round*\n\n` +
      `💰 Prize: *${format_number(round.prize)} WEBD* ($${format_number(
        prize_usd
      )})\n` +
      `👥 Participants: *${format_number(participants.length)}*\n` +
      `🎟 Tickets: *${format_number(tickets_number)}*\n` +
      `💵 Current Price: *${format_number(price)} WEBD* / ticket\n` +
      `📅 Ends in *${days_until_next_round}* days ([block ${round.end_block_height}](${webdchain.url}))`;

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
