const transaction_model = require('./../models').transaction.model;
const config = require('./../config');
const axios = require('axios');

const url = `https://webdchain.io:2053/address-txs?address=${encodeURIComponent(
  config.vault
)}`;

exports.handler = async function (event) {
  const response = await axios.get(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  const transactions = response.data;

  console.log('found transactions', transactions.length);

  for (const { txId, tx } of transactions) {
    if (tx.data.to.addresses.length > 1) {
      continue;
    }

    if (tx.data.from.addresses.length > 1) {
      continue;
    }

    if (
      tx.data.to.addresses.length &&
      tx.data.to.addresses[0].address !== config.vault
    ) {
      continue;
    }

    var amount = tx.data.to.addresses.length
      ? parseInt(tx.data.to.addresses[0].amount) / 10000
      : 0;
    var wallet = tx.data.to.addresses.length
      ? tx.data.to.addresses[0].address
      : null;

    console.log('found transaction', txId, 'amount', amount, 'from', wallet);

    await transaction_model.findOrCreate({
      where: {
        extra_data: txId,
      },
      defaults: {
        type: 'deposit',
        amount: amount,
        transaction_from: wallet,
        extra_data: txId,
      },
      logging: false,
    });
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
