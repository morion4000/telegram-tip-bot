var user_model = require('./../models').user.model,
  coin_model = require('./../models').coin.model,
  tip_model = require('./../models').tip.model,
  config = require('./../config'),
  async = require('async'),
  numeral = require('numeral'),
  _ = require('underscore'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var user_match = msg.text.match(/ @\w+ /);
      var amount_match = msg.text.match(/ [0-9]+/);
      var resp = '';

      console.log(msg.text, msg.chat.id, msg.forward_from);

      if (msg.text.indexOf('beer') !== -1) {
        var beer_price = parseInt(1 / config.webd_price_usd);
        amount_match = [beer_price];
      } else if (msg.text.indexOf('block') !== -1) {
        amount_match = [6000];
      } else if (msg.text.indexOf('banana') !== -1) {
        var banana_price = parseInt(0.1 / config.webd_price_usd);
        amount_match = [banana_price];
      }

      if (user_match === null || amount_match === null) {
        resp = 'Please specify a user and an amount: /tip @user 1000';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      var to_username = user_match[0];
      var amount = amount_match[0];

      if (to_username === '@webdollar_tip_bot') {
        to_username = user_match[1];
      }

      to_username = to_username.trim();
      to_username = to_username.substr(1);

      if (_.isString(amount)) {
        amount = amount.trim();
      }

      amount = parseInt(amount);

      async.parallel(
        [
          function (callback) {
            user_model
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
              .then(function (res) {
                callback(null, res);
              })
              .catch(callback);
          },
          function (callback) {
            user_model
              .findOrCreate({
                where: {
                  telegram_username: to_username,
                },
                defaults: {
                  telegram_username: to_username,
                  balance: config.initial_balance,
                },
                logging: false,
              })
              .then(function (res) {
                callback(null, res[0]);
              })
              .catch(callback);
          },
          function (callback) {
            coin_model
              .findOne({
                where: {
                  ticker: 'WEBD',
                },
              })
              .then(function (res) {
                callback(null, res);
              })
              .catch(callback);
          },
        ],
        function (err, users) {
          if (err) {
            console.error(err);
            resp = error;
          }

          if (!users[0]) {
            resp =
              'No Account. Please DM the bot: @webdollar_tip_bot to set up an account.';

            bot.sendMessage(msg.chat.id, resp, {
              //parse_mode: 'Markdown',
              disable_web_page_preview: true,
              disable_notification: true,
            });

            return;
          }

          var from_user = users[0];
          var to_user = users[1];
          var webdollar = users[2];
          var amount_usd = webdollar
            ? parseFloat(webdollar.price_usd * amount)
            : 0;
          var to_user_balance =
            to_user.balance === null ? config.initial_balance : to_user.balance;
          var from_user_balance =
            from_user.balance === null
              ? config.initial_balance
              : from_user.balance;

          if (from_user_balance - config.fees.tip < amount) {
            resp =
              '@' +
              from_user.telegram_username +
              ' has not enough balance (' +
              numeral(amount).format('0,0') +
              ' + ' +
              config.fees.tip +
              ' fee). go to @webdollar_tip_bot and follow the instructions to /deposit more.';
          } else if (from_user.id === to_user.id) {
            resp = 'You can not tip yourself.';
          } else if (amount < 10 || amount > 10000000) {
            resp = 'Please send between 10 and 10,000,000 WEBD.';
          } else {
            tip_model.create({
              amount: amount,
              private: msg.chat.type === 'private' ? true : false,
              telegram_id: msg.chat.id,
              telegram_message_id: msg.message_id,
              telegram_chat_id: msg.chat.id,
              telegram_text: msg.text,
              from_user: from_user.id,
              to_user: to_user.id,
            });

            user_model.update(
              {
                balance: to_user_balance + amount,
              },
              {
                where: {
                  id: to_user.id,
                },
              }
            );

            user_model.update(
              {
                balance: from_user_balance - amount - config.fees.tip,
              },
              {
                where: {
                  id: from_user.id,
                },
              }
            );

            if (to_user.telegram_id) {
              var tip_msg =
                'You were tipped ' +
                numeral(amount).format('0,0') +
                ' WEBD ($' +
                numeral(amount_usd).format('0,0.00') +
                ') by @' +
                from_user.telegram_username +
                '. Funds in your /tipbalance are receiving /staking rewards.';

              bot.sendMessage(to_user.telegram_id, tip_msg, {
                //parse_mode: 'Markdown',
                disable_web_page_preview: true,
                disable_notification: true,
              });
            }

            resp =
              '@' +
              to_user.telegram_username +
              ' was tipped ' +
              numeral(amount).format('0,0') +
              ' WEBD ($' +
              numeral(amount_usd).format('0,0.00') +
              ') by @' +
              from_user.telegram_username;
          }

          bot.sendMessage(msg.chat.id, resp, {
            //parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });
        }
      );
    } catch (e) {
      console.error('/tip', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
