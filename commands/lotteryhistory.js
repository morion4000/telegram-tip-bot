const moment = require('moment');

const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const user_model = require('./../models').user.model;
const { format_number } = require('./../utils');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    const webdchain = new Webdchain();
    const current_height = await webdchain.get_height();
    const lottery = new Lottery(current_height);

    const rounds = await lottery.get_rounds();
    let message = `🎲  Latest 10 rounds:\n\n`;

    for (const round of rounds.splice(0, 10)) {
      const user = await user_model.findOne({
        where: {
          id: round.winner_1_user_id,
        },
      });
      const bonus = round.bonus ? round.bonus : 0;
      const prize = Math.floor(round.prize + bonus);

      if (user) {
        message += `\t\t▫️ ${moment(round.ended_at).format('MMMM Do')}: ${user.telegram_username} won ${format_number(
          prize
        )} WEBD (${format_number(round.winner_1_chance)}% chance) with number ${round.winner_1_ticket_number}\n`;
      }
    }

    await telegram.send_message(
      msg.chat.id,
      message,
      Telegram.PARSE_MODE.HTML,
      true
    );
  } catch (e) {
    console.log(e);
  }
};
