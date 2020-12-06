var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text);

      if (msg.chat.type !== 'private') {
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

      var from_first_name = msg.from.first_name
        ? msg.from.first_name.replace(/[\u0800-\uFFFF]/g, '')
        : null;
      var from_last_name = msg.from.last_name
        ? msg.from.last_name.replace(/[\u0800-\uFFFF]/g, '')
        : null;

      user.model
        .findOrCreate({
          where: {
            telegram_username: msg.from.username,
          },
          defaults: {
            telegram_id: msg.from.id,
            telegram_username: msg.from.username,
            telegram_firstname: from_first_name,
            telegram_lastname: from_last_name,
            balance: config.initial_balance,
          },
          logging: false,
        })
        .then(function (result) {
          var found_user = result[0];
          var found = result[1];

          if (found) {
            resp =
              'Welcome back ' +
              found_user.telegram_username +
              '. Type /help to learn more.';
          } else {
            resp =
              'Welcome to WebDollar Telegram Bot, an account with ' +
              config.initial_balance +
              ' WEBD was created for you.\n\nType /help to learn more, but first /setwallet WALLET.';
          }

          user.model.update(
            {
              telegram_id: msg.from.id,
              telegram_username: msg.chat.username,
              telegram_firstname: from_first_name,
              telegram_lastname: from_last_name,
            },
            {
              where: {
                id: found_user.id,
              },
            }
          );

          bot.sendMessage(msg.chat.id, resp, {
            //parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });
        })
        .catch(console.error);
    } catch (e) {
      console.error('/start', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
