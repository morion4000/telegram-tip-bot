var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    var resp = '';

    console.log(msg.text, msg.chat.id);

    if (
      msg.chat.type !== 'private' &&
      !config.public_channels.includes(msg.chat.id)
    ) {
      resp =
        'Private command. Please DM the bot: @webdollar_tip_bot to use the command.';

      bot.sendMessage(msg.chat.id, resp, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });

      return;
    }

    resp =
      'You need to specify the amount you want to withdraw: /withdraw AMOUNT';

    bot.sendMessage(msg.chat.id, resp, {
      //parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/withdraw_command.jpg'
    );
  };
};

module.exports = Command;
