var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    var resp =
      'You need to specify the user and amount in WEBD or USD: `/tip @morion4000 1000` or `/tip @morion4000 $1`';

    console.log(msg.text, msg.chat.id);

    bot.sendMessage(msg.chat.id, resp, {
      //parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/tip_command.jpg'
    );
  };
};

module.exports = Command;
