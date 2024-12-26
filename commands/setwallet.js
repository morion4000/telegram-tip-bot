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
          'Private command. Please message @webdollar_tip_bot to use the command.';

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

      var wallet_match = msg.text.match(/WEBD\$[a-km-zA-NP-Z0-9+@#$]{33,34}\$/);

      if (wallet_match === null) {
        resp = 'Wallet is invalid. Could not set it.';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        bot.sendPhoto(
          msg.chat.id,
          'https://www.hostero.eu/assets/img/tipbot/setwallet_command.jpg'
        );

        return;
      }

      var wallet = wallet_match[0];

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
          logging: false,
        })
        .then(function (result) {
          var found_user = result;

          if (!found_user) {
            resp = 'No Account. Please use /start to set up one.';

            bot.sendMessage(msg.chat.id, resp, {
              //parse_mode: 'Markdown',
              disable_web_page_preview: true,
              disable_notification: true,
            });

            return;
          }

          user.model
            .update(
              {
                wallet: wallet,
              },
              {
                where: {
                  id: found_user.id,
                },
              }
            )
            .then(function (result) {
              resp = 'You wallet was set to: `' + wallet + '`';

              bot.sendMessage(msg.chat.id, resp, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                disable_notification: true,
              });

              bot.sendPhoto(
                msg.chat.id,
                'https://www.hostero.eu/assets/img/tipbot/setwallet_command.jpg'
              );
            })
            .catch(function (error) {
              console.error(error);

              resp =
                'There was an error setting your wallet. Wallet is not available.';

              bot.sendMessage(msg.chat.id, resp, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                disable_notification: true,
              });
            });
        })
        .catch(function (error) {
          console.error(error);

          resp =
            'There was an error setting your wallet. Please contact @morion4000';

          bot.sendMessage(msg.chat.id, resp, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });
        });
    } catch (e) {
      console.error('/setwallet', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
