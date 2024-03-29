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
      tx.data.to.addresses[0].address === config.vault
    ) {
      continue;
    }

    var amount = tx.data.to.addresses.length
      ? parseInt(tx.data.to.addresses[0].amount) / 10000
      : 0;
    var wallet = tx.data.to.addresses.length
      ? tx.data.to.addresses[0].address
      : null;
    var nonce = tx.data.nonce;

    console.log(
      'found transaction',
      txId,
      'amount',
      amount,
      'to',
      wallet,
      'nonce',
      nonce
    );

    await transaction_model.update(
      {
        processed: true,
      },
      {
        where: {
          type: 'withdraw',
          amount: amount,
          transaction_to: wallet,
          extra_data: nonce,
        },
        logging: console.logs,
      }
    );
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
