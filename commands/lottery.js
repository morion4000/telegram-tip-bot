/*
    - prize pool
    - remaining time,
    - participation stats for the current user (if command ran in private chat)
*/

const user = require('./../models').user;
const Lottery = require('./../services/lottery');
const config = require('./../config');
const _ = require('underscore');

const Command = function (bot) {
  return async function (msg, match) {
    console.log(msg.text, msg.chat.id);

    const lottery = new Lottery();
    var resp = 'Not implemented';

    const round = await lottery.get_last_round();
    const participants = await lottery.get_unique_users_for_round(round);

    resp = `Round ${round.name}. Prize ${round.prize}. Participants ${participants.length}`;

    bot.sendMessage(msg.chat.id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  };
};

module.exports = Command;
