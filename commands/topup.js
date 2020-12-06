var config = require('./../config'),
  _ = require('underscore'),
  numeral = require('numeral');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text);

      if (!msg.from.username) {
        resp =
          'You need to create an username for your account on Telegram to be able to use the bot.';

        return bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });
      }

      if (msg.chat.type !== 'private') {
        resp =
          'Private command. Please DM the bot: @webdollar_tip_bot to use the command.';

        return bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });
      } else {
        resp = 'Purchasing WEBD using the bot has been disabled.';

        return bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        var url = 'https://pay.hostero.eu/tipbot?username=' + msg.from.username;

        resp =
          'When you complete the payment, the WEBD amount you purchased is going to be credited to your /tipbalance instantly.\n\n' +
          'Available packages:\n\n' +
          '\t 💰 10,000 WEBD - 💵 2 USD\n' +
          '\t 💰 100,000 WEBD - 💵 15 USD\n' +
          '\t 💰 1,000,000 WEBD - 💵 120 USD\n\n' +
          'By clicking on the button, you will be redirected to a payment page where you can select the payment method.\n';

        bot.sendMessage(msg.chat.id, resp, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Buy 10,000 WEBD',
                  url:
                    url +
                    '&amount=10000&price=2&stripe_price=price_1HOMGjAYZXIJrrBK1uukJQte',
                },
                {
                  text: 'Buy 100,000 WEBD',
                  url:
                    url +
                    '&amount=100000&price=15&stripe_price=price_1HOMHdAYZXIJrrBKgbmDPH0I',
                },
                {
                  text: 'Buy 1,000,000 WEBD',
                  url:
                    url +
                    '&amount=1000000&price=120&stripe_price=price_1HOMIAAYZXIJrrBKIAYJjcpI',
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
