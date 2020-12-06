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

      user.model
        .findOne({
          where: {
            telegram_id: msg.from.id,
          },
        })
        .then(function (found_user) {
          if (found_user) {
            var wallet = found_user.wallet || 'None';

            resp =
              'You set the following wallet: `' +
              wallet +
              '`\n\nUse /setwallet to change it.';
          } else {
            resp = 'Your user can not be found. Create a new acount /start';
          }

          bot.sendMessage(msg.chat.id, resp, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });
        })
        .catch(console.error);
    } catch (e) {
      console.error('/wallet', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
