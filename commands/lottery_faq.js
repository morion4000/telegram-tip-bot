var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    var resp = 'Not implemented';

    console.log(msg.text, msg.chat.id);

    // https://en.wikipedia.org/wiki/Premium_Bond
    // https://webdchain.io/block/0000000000000419f11950bab07f1ea973eecf0bf40b8fae4975cad412f7143b
    // https://www.rapidtables.com/convert/number/hex-to-decimal.html

    bot.sendMessage(msg.chat.id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  };
};

module.exports = Command;
