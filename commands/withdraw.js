var user = require('./../models').user,
  transaction = require('./../models').transaction,
  config = require('./../config'),
  numeral = require('numeral'),
  mailgun = require('mailgun-js')({
    apiKey: config.mailgun.key,
    domain: config.mailgun.domain,
  }),
  _ = require('underscore'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var amount_match = msg.text.match(/ [0-9]+/);
      var wallet_match = msg.text.match(
        /WEBD\$[a-km-zA-NP-Z0-9+@#$]{33,34}\$$/
      );
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

      if (amount_match === null) {
        resp = 'Please specify an amount: /withdraw 1000';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      var amount = amount_match[0];
      var wallet = wallet_match ? wallet_match[0] : null;

      if (_.isString(amount)) {
        amount = amount.trim();
      }

      amount = parseInt(amount);

      if (wallet && wallet === config.vault) {
        resp = 'You can not withdraw to vault. Please use another address.';

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
            wallet = wallet || found_user.wallet;

            if (wallet) {
              if (amount < config.fees.withdraw) {
                resp =
                  'You can only withdraw over ' +
                  config.fees.withdraw +
                  ' WEBD';
              } else if (found_user.balance - config.fees.withdraw < amount) {
                resp =
                  'Not enough balance (' +
                  amount +
                  ' + ' +
                  config.fees.withdraw +
                  ' WEBD fee). Check your /tipbalance';
              } else {
                transaction.model.create({
                  type: 'withdraw',
                  user_id: found_user.id,
                  processed: false,
                  amount: amount,
                  transaction_to: wallet,
                });

                user.model.update(
                  {
                    balance: found_user.balance - amount - config.fees.withdraw,
                  },
                  {
                    where: {
                      id: found_user.id,
                    },
                  }
                );

                resp =
                  'The withdraw request has been made and the funds *' +
                  numeral(amount).format('0,0') +
                  ' WEBD* are going to be in your wallet `' +
                  wallet +
                  '` in up to an hour.\n\n*Withdraw fee:* ' +
                  config.fees.withdraw +
                  ' WEBD';

                /*
                  mailgun.messages().send({
                    from: 'Hostero <no-reply@mg.hostero.eu>',
                    to: config.admin.email,
                    subject: '[SYSTEM] NEW WITHDRAWAL - Telegram Tip Bot',
                    text: resp
                  });
                  */
              }
            } else {
              resp = 'Configure your wallet first /setwallet';
            }
          } else {
            resp = 'Your user can not be found. Create a new acount /start';
          }

          bot.sendMessage(msg.chat.id, resp, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });

          // bot.sendPhoto(
          //   msg.chat.id,
          //   'https://www.hostero.eu/assets/img/tipbot/withdraw_command.jpg'
          // );
        })
        .catch(console.error);
    } catch (e) {
      console.error('/withdraw', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
