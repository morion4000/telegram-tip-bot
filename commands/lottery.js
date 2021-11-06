const moment = require('moment');

const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const { format_number, convert_to_usd } = require('./../utils');
const config = require('./../config');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    const webdchain = new Webdchain();
    const current_height = await webdchain.get_height();
    const lottery = new Lottery(current_height);

    const round = await lottery.get_last_round();
    const bonus = round.bonus;
    const bonus_usd = await convert_to_usd(bonus);
    const unique_users = await lottery.get_unique_users_for_round(round);
    const tickets_number = round.tickets;
    const prize_usd = await convert_to_usd(round.prize);
    const days_until_next_round = await lottery.calculate_days_until_next_round(
      round
    );
    const date_start_formatted = moment(round.started_at).format('MMMM Do');
    const date_end_formatted = moment(round.started_at)
      .add(config.lottery.duration_days, 'days')
      .format('MMMM Do');
    let message = `🎲 *Weekly round* (${date_start_formatted} - ${date_end_formatted})\n\n`;

    message += `💰 Prize: *${format_number(
      parseInt(round.prize)
    )} WEBD* ($${format_number(prize_usd)})\n`;

    if (bonus) {
      message += `🎁 Bonus: *${format_number(bonus)} WEBD* ($${format_number(
        bonus_usd
      )})\n`;
    }

    message += `👥 Participants: *${format_number(unique_users.length)}*\n`;
    message += `🎟 Tickets: *${format_number(tickets_number)}*\n`;
    message += `📅 Ends in ~*${days_until_next_round}* days ([block ${round.end_block_height}](${webdchain.url}))`;

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
