var user = require('./../models').user,
  tip = require('./../models').tip,
  transaction = require('./../models').transaction,
  config = require('./../config'),
  _ = require('underscore'),
  numeral = require('numeral'),
  request = require('request'),
  async = require('async');

var Command = function (bot) {
  return function (msg, match) {
    try {
      const url = `https://webdchain.io:2053/address?address=${encodeURIComponent(
        config.vault
      )}`;
      var resp = '';

      console.log(msg.text, msg.chat.id);

      if (!msg.from.username) {
        return;
      }

      if (msg.from.username !== config.admin.telegram_username) {
        console.log('forbidden', msg.from.username);
        return;
      }

      async.parallel(
        [
          function (callback) {
            user.model.count().then(function (res) {
              callback(null, res);
            });
          },
          function (callback) {
            user.model.sum('balance').then(function (res) {
              callback(null, res);
            });
          },
          function (callback) {
            tip.model.count().then(function (res) {
              callback(null, res);
            });
          },
          function (callback) {
            tip.model.sum('amount').then(function (res) {
              callback(null, res);
            });
          },
          function (callback) {
            transaction.model.count().then(function (res) {
              callback(null, res);
            });
          },
          function (callback) {
            transaction.model
              .count({
                where: {
                  processed: 0,
                  deleted: 0,
                },
              })
              .then(function (res) {
                callback(null, res);
              });
          },
          function (callback) {
            request(
              {
                url: url,
                headers: {
                  accept: 'application/json',
                },
              },
              function (error, response, body) {
                try {
                  var account = JSON.parse(body);
                  var balance = parseInt(account.balance) / 10000;
                } catch (err) {
                  return callback(err);
                }

                callback(error, balance);
              }
            );
          },
          /*
          function(callback) {
            var minimum_stake = parseInt(1 / (config.staking.monthly_percentage / 3000));
            console.log(minimum_stake);

            user.model.count({
              where: {
                balance: {
                  $gt: minimum_stake
                }
              }
            }).then(function(res) {
              callback(null, res);
            });
          }
          */
        ],
        function (err, results) {
          if (err) {
            console.log(err);

            return;
          }

          var vault_delta = results[6] - results[1];

          resp =
            'System statistics:\n\n' +
            '- users: ' +
            results[0] +
            '\n' +
            '- users (total balance): ' +
            numeral(results[1]).format('0,0') +
            '\n' +
            '- tips: ' +
            results[2] +
            '\n' +
            '- tips (total amount): ' +
            numeral(results[3]).format('0,0') +
            '\n' +
            '- transactions: ' +
            results[4] +
            '\n' +
            '- transactions (pending): ' +
            results[5] +
            '\n' +
            '- vault: ' +
            numeral(results[6]).format('0,0') +
            '\n' +
            '- vault (delta): ' +
            numeral(vault_delta).format('0,0') +
            '\n';

          bot.sendMessage(msg.chat.id, resp, {
            //parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: true,
          });
        }
      );
    } catch (e) {
      console.error('/system', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
