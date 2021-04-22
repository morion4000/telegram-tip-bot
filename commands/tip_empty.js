var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    var resp = 'You need to specify the user and amount: /tip @user 1000';

    console.log(msg.text, msg.chat.id);

    bot.sendMessage(msg.chat.id, resp, {
      //parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  };
};

module.exports = Command;
