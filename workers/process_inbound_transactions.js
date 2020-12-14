const transaction_model = require('./../models').transaction.model;
const config = require('./../config');
const axios = require('axios');

const url = `https://www.webdscan.io/api/transactions?address=${encodeURIComponent(
  config.vault
)}`;

exports.handler = async function (event) {
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${config.webdscan.token}`,
      Accept: 'application/json',
    },
  });

  const transactions = response.data;

  console.log('found transactions', transactions.length);

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];

    if (transaction.toAddresses.length > 1) {
      continue;
    }

    if (transaction.fromAddresses.length > 1) {
      continue;
    }

    if (transaction.toAddresses[0].address.address !== config.vault) {
      continue;
    }

    if (!transaction.isConfirmed) {
      console.log('transaction', transaction.hash, 'not yet confirmed');
      continue;
    }

    var amount = transaction.amount.amount / 10000;
    var wallet = transaction.fromAddresses[0].address.address;

    amount = parseInt(amount);

    console.log(
      'found transaction',
      transaction.hash,
      'amount',
      amount,
      'from',
      wallet
    );

    await transaction_model.findOrCreate({
      where: {
        transaction_hash: transaction.hash,
      },
      defaults: {
        type: 'deposit',
        amount: amount,
        transaction_from: wallet,
        transaction_hash: transaction.hash,
      },
      logging: false,
    });
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
