var config = require('./../config'),
  _ = require('underscore'),
  numeral = require('numeral');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text);

      if (!msg.from.username) {
        return;
      }

      if (msg.chat.type !== 'private') {
        resp =
          'Private command. Please DM the bot: @webdollar_tip_bot to use the command.';

        return bot.sendMessage(msg.chat.id, resp, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });
      } else {
        var url = 'https://pay.hostero.eu/tipbot?username=' + msg.from.username;

        resp =
          'When you complete the payment, the WEBD amount you purchased is going to be credited to your tip bot account instantly.\n\n' +
          'Available packages:\n\n' +
          '\t 💰 10,000 WEBD - 💵 1 USD\n' +
          '\t 💰 100,000 WEBD - 💵 5 USD\n' +
          '\t 💰 1,000,000 WEBD - 💵 50 USD\n\n' +
          'By clicking on the button, you will be redirected to a payment page where you can select the payment method.\n';

        bot.sendMessage(msg.chat.id, resp, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Buy 10,000 WEBD',
                  url:
                    url +
                    '&amount=10000&price=1&stripe_price=price_1HNyvvAYZXIJrrBKpeOMlMOK',
                },
                {
                  text: 'Buy 100,000 WEBD',
                  url:
                    url +
                    '&amount=100000&price=5&stripe_price=price_1HNzfUAYZXIJrrBKPIHzX0zo',
                },
                {
                  text: 'Buy 1,000,000 WEBD',
                  url:
                    url +
                    '&amount=1000000&price=50&stripe_price=price_1HNzfmAYZXIJrrBKJnRQ1sQh',
                },
              ],
            ],
          },
        });
      }
    } catch (e) {
      console.error('/toptup', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
