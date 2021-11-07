var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return function (msg, match) {
    try {
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

      if (!msg.from.username) {
        resp =
          'Please set an username for your telegram account to use the bot.';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      // resp = 'Depositing WEBD using the bot has been disabled.';

      // return bot.sendMessage(msg.chat.id, resp, {
      //   //parse_mode: 'Markdown',
      //   disable_web_page_preview: true,
      //   disable_notification: true,
      // });

      user.model
        .findOne({
          where: {
            [Sequelize.Op.or]: [
              {
                telegram_id: msg.from.id,
              },
              {
                telegram_username: msg.from.username,
              },
            ],
          },
        })
        .then(function (found_user) {
          if (found_user) {
            if (found_user.wallet) {
              //var link = 'https://webdollar.io/payment/' + config.vault;
              //resp = 'Go to ' + link + ' and complete the transfer, or deposit WEBD to the following address: *' + config.vault + '*';
              resp =
                '🌐 Transfer your funds to the following address: `' +
                config.vault +
                '`\n\nℹ️ Make sure you make the transfer from the /wallet you set.';
            } else {
              resp = 'ℹ️ Configure your wallet first /setwallet';
            }
          } else {
            resp = 'ℹ️ Your user can not be found. Create a new acount /start';
          }

          bot.sendMessage(msg.chat.id, resp, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });

          // bot.sendPhoto(
          //   msg.chat.id,
          //   'https://www.hostero.eu/assets/img/tipbot/deposit_command.jpg'
          // );
        })
        .catch(console.error);
    } catch (e) {
      console.error('/deposit', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
