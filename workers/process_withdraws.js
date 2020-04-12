var transaction_model = require('./../models').transaction.model,
  user_model = require('./../models').user.model,
  config = require('./../config'),
  TelegramBot = require('node-telegram-bot-api'),
  _ = require('underscore'),
  request = require('request'),
  numeral = require('numeral'),
  mailgun = require('mailgun-js')({
    apiKey: config.mailgun.key,
    domain: config.mailgun.domain
  });

var TRANSACTION_FEE = 9;
var MAX_TRIES = 1;
var FROM_ADDRESS = config.vault;
var API_KEY = config.webdollar.node.key;
var URL = config.webdollar.node.url + '/' + API_KEY;

console.log('started worker');

setTimeout(function() {
  process.exit(1);
}, 300 * 1000); // 5 minutes

var bot = new TelegramBot(config.telegram.token, {
  polling: false
});

transaction_model.findAll({
    where: {
      type: 'withdraw',
      processed: false,
      deleted: false
    },
    logging: false
  })
  .then(function(transactions) {
    console.log('found transactions', transactions.length);

    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      if (transaction.tries >= MAX_TRIES) {
        console.log('transaction', transaction.id, 'tried', transaction.tries, 'aborting...');
        continue;
      }

      (function(_transaction) {
        setTimeout(function() {
          console.log('processing transaction', _transaction.id);

          var transaction_to = encodeURIComponent(_transaction.transaction_to);

          var url = URL + '/wallets/create-transaction/' + FROM_ADDRESS + '/' +
            transaction_to + '/' + _transaction.amount + '/' + TRANSACTION_FEE;

          console.log('calling', url);

          request({
            url: url,
            headers: {
              accept: 'application/json'
            }
          }, function(error, response, body) {
            var data = JSON.parse(body);

            if (data.result === true) {
              console.log('sent transaction with nonce', data.transaction.nonce);

              transaction_model.update({
                extra_data: data.transaction.nonce,
                tries: _transaction.tries + 1
              }, {
                where: {
                  id: _transaction.id
                }
              });

              user_model.findOne({
                  where: {
                    id: _transaction.user_id
                  }
                })
                .then(function(user) {
                  if (user.telegram_id) {
                    var resp = '🆕 *Update*: Withdraw transaction is being processed. Your wallet *' + _transaction.transaction_to + '* will receive *' + numeral(_transaction.amount).format('0,0') + ' WEBD*.';

                    bot.sendMessage(user.telegram_id, resp, {
                      parse_mode: 'Markdown',
                      disable_web_page_preview: true,
                      disable_notification: true,
                    });
                  }
                });
            } else {
              console.error('error sending transaction', error, body);

              mailgun.messages().send({
                from: 'Hostero <no-reply@mg.hostero.eu>',
                to: config.admin.email,
                subject: '[SYSTEM] WITHDRAWAL ERROR - Telegram Tip Bot',
                text: body
              });
            }
          });
        }, i * 5000);
      })(transaction);
    }
  })
  .catch(console.error);
