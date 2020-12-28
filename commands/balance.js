var user = require('./../models').user,
  config = require('./../config'),
  numeral = require('numeral'),
  _ = require('underscore'),
  Sequelize = require('sequelize');

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
          'Please set an username for your Telegram account to use the bot.';

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
            resp =
              '💰 Balance: *' +
              numeral(found_user.balance).format('0,0') +
              '* WEBD. Receiving /staking rewards @ *' +
              config.staking.yearly_percentage +
              '%* per year.\n\n';
            resp += '💵 You can add more funds using /topup.';
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
      console.error('/balance', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
