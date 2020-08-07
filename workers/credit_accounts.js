var transaction_model = require('./../models').transaction.model,
  user_model = require('./../models').user.model,
  config = require('./../config'),
  TelegramBot = require('node-telegram-bot-api'),
  numeral = require('numeral'),
  _ = require('underscore');

console.log('started worker');

setTimeout(function() {
  process.exit(1);
}, 60 * 1000);

var bot = new TelegramBot(config.telegram.token, {
  polling: false
});

transaction_model.findAll({
    where: {
      type: 'deposit',
      processed: false
    },
    logging: false
  })
  .then(function(transactions) {
    console.log('found transactions', transactions.length);

    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      (function(_transaction) {
        console.log('processing transaction', _transaction.id);

        user_model.findOne({
            where: {
              wallet: _transaction.transaction_from
            }
          })
          .then(function(user) {
            if (!user) {
              console.log('user not found with wallet', _transaction.transaction_from);
              return;
            }

            var new_balance = user.balance + _transaction.amount;

            console.log('crediting', user.id, 'with', _transaction.amount);

            user_model.update({
              balance: new_balance
            }, {
              where: {
                id: user.id
              }
            });

            transaction_model.update({
              user_id: user.id,
              processed: true
            }, {
              where: {
                id: _transaction.id
              }
            });

            if (user.telegram_id) {
              var resp = '🆕 *Update*: Your account was credited with ' + numeral(_transaction.amount).format('0,0') + ' WEBD. Funds in your /tipbalance are receiving /staking rewards.';

              bot.sendMessage(user.telegram_id, resp, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                disable_notification: true,
              });
            }
          });
      })(transaction);
    }
  })
  .catch(console.error);
