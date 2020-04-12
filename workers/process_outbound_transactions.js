var transaction_model = require('./../models').transaction.model,
  config = require('./../config'),
  _ = require('underscore'),
  request = require('request');

var url = 'https://www.webdscan.io/api/transactions?address=' + encodeURIComponent(config.vault);

setTimeout(function() {
  process.exit(1);
}, 60 * 1000);

request({
  url: url,
  auth: {
    bearer: config.webdscan.token
  },
  headers: {
    accept: 'application/json'
  }
}, function(error, response, body) {
  var transactions = JSON.parse(body);

  console.log('found transactions', transactions.length);

  for (var i = 0; i < transactions.length; i++) {
    var transaction = transactions[i];

    if (transaction.toAddresses.length > 1) {
      continue;
    }

    if (transaction.fromAddresses.length > 1) {
      continue;
    }

    if (transaction.toAddresses[0].address.address === config.vault) {
      continue;
    }

    if (!transaction.isConfirmed) {
      console.log('transaction', transaction.hash, 'not yet confirmed');
      continue;
    }

    var amount = transaction.amount.amount / 10000;
    var wallet = transaction.toAddresses[0].address.address;
    var nonce = transaction.nonce;

    amount = parseInt(amount);

    console.log('found transaction', transaction.hash, 'amount', amount, 'to', wallet, 'nonce', nonce);

    transaction_model.update({
      processed: true,
      transaction_hash: transaction.hash
    }, {
      where: {
        type: 'withdraw',
        amount: amount,
        transaction_to: wallet,
        extra_data: nonce
      }
    });
  }
});
