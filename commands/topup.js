var config = require('./../config'),
  _ = require('underscore'),
  numeral = require('numeral');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text, msg.chat.id);

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
//         resp = 'Purchasing WEBD using the bot has been disabled.';
//         return bot.sendMessage(msg.chat.id, resp, {
//           //parse_mode: 'Markdown',
//           disable_web_page_preview: true,
//           disable_notification: true,
//         });

        var url = `https://pay.hostero.eu/tipbot?username=${msg.from.username}`;
        var package1_webd = numeral(config.topup.package1.webd).format('0,0');
        var package2_webd = numeral(config.topup.package2.webd).format('0,0');
        var package3_webd = numeral(config.topup.package3.webd).format('0,0');

        resp =
          '<u><b>Available packages</b></u>\n\n' +
          `\t 💰 ${package1_webd} WEBD - 💵 ${config.topup.package1.usd} USD\n` +
          //`\t 💰 ${package2_webd} WEBD - 💵 ${config.topup.package2.usd} USD\n` +
          //`\t 💰 ${package3_webd} WEBD - 💵 ${config.topup.package3.usd} USD\n\n` +
          '▫️ <i>The amount is going to be credited to your /tipbalance after you complete the payment</i>\n' +
          '▫️ <i>Prices displayed include a comission and are subjected to change without notice</i>\n' +
          '▫️ <i>Links are related to your account. If someone else uses them, your account is going to be credited</i>\n\n' +
          '📌 By clicking on a button, you will be redirected to a web page where you can make the payment\n';

        bot.sendMessage(msg.chat.id, resp, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          disable_notification: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Buy ${package1_webd} WEBD`,
                  url: `${url}&amount=${config.topup.package1.webd}&price=${config.topup.package1.usd}`,
                },
//                 {
//                   text: `Buy ${package2_webd} WEBD`,
//                   url: `${url}&amount=${config.topup.package2.webd}&price=${config.topup.package2.usd}`,
//                 },
//                 {
//                   text: `Buy ${package3_webd} WEBD`,
//                   url: `${url}&amount=${config.topup.package3.webd}&price=${config.topup.package3.usd}`,
//                 },
              ],
            ],
          },
        });

        bot.sendPhoto(
          msg.chat.id,
          'https://www.hostero.eu/assets/img/tipbot/topup_command.jpg'
        );
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
