var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    var resp =
      'ℹ️ You need to specify the username and amount (WEBD or USD).\n\nExamples:\n' +
      '\t▫️ `/tip @webdollar_tip_bot 1000`\n' +
      '\t▫️ `/tip @webdollar_tip_bot $1`\n';

    console.log(msg.text, msg.chat.id);

    bot.sendMessage(msg.chat.id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });

    if (msg.chat && msg.chat.type && msg.chat.type === 'private') {
      bot.sendPhoto(
        msg.chat.id,
        'https://www.hostero.eu/assets/img/tipbot/tip_command.jpg'
      );
    }
  };
};

module.exports = Command;
