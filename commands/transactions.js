var user = require('./../models').user,
  transaction = require('./../models').transaction,
  config = require('./../config'),
  numeral = require('numeral'),
  moment = require('moment'),
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
            resp = 'ℹ️ Latest 10 transactions:\n\n';

            transaction.model
              .findAll({
                where: {
                  user_id: found_user.id,
                },
              })
              .then(function (transactions) {
                transactions = transactions.reverse();

                for (var i = 0; i < transactions.length; i++) {
                  if (i > 10) {
                    break;
                  }

                  var t = transactions[i];
                  var status = t.processed ? 'Completed' : 'Pending';

                  resp +=
                    '\t\t▫️ ' +
                    moment(t.createdAt).format('MMMM Do') +
                    ': ' +
                    status +
                    ' ' +
                    t.type +
                    ' of *' +
                    numeral(t.amount).format('0,0') +
                    '* WEBD\n';
                }

                bot.sendMessage(msg.chat.id, resp, {
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true,
                  disable_notification: true,
                });

                // bot.sendPhoto(
                //   msg.chat.id,
                //   'https://www.hostero.eu/assets/img/tipbot/transactions_command.jpg'
                // );
              });
          } else {
            resp = 'Your user can not be found. Create a new acount /start';

            bot.sendMessage(msg.chat.id, resp, {
              parse_mode: 'Markdown',
              disable_web_page_preview: true,
              disable_notification: true,
            });
          }
        })
        .catch(console.error);
    } catch (e) {
      console.error('/transactions', e);
    }
  };
};

module.exports = Command;
