var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    var resp = '⚙️ The fees are the following: \n\n';

    console.log(msg.text, msg.chat.id);

    resp += '\t\t▫️ Tipping: ' + config.fees.tip + ' WEBD \n';
    resp += '\t\t▫️ Deposit: ' + config.fees.deposit + ' WEBD \n';
    resp += '\t\t▫️ Withdraw: ' + config.fees.withdraw + ' WEBD \n';

    bot.sendMessage(msg.chat.id, resp, {
      //parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });

    if (msg.chat.type === 'private') {
      // bot.sendPhoto(
      //   msg.chat.id,
      //   'https://www.hostero.eu/assets/img/tipbot/fees_command.jpg'
      // );
    }
  };
};

module.exports = Command;
