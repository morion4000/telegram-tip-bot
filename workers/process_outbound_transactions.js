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

    if (transaction.toAddresses[0].address.address === config.vault) {
      continue;
    }

    if (!transaction.isConfirmed) {
      console.log('transaction', transaction.hash, 'not yet confirmed');
      continue;
    }

    const amount = parseInt(transaction.amount.amount / 10000);
    const wallet = transaction.toAddresses[0].address.address;
    const nonce = transaction.nonce;

    console.log(
      'found transaction',
      transaction.hash,
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
        transaction_hash: transaction.hash,
      },
      {
        where: {
          type: 'withdraw',
          amount: amount,
          transaction_to: wallet,
          extra_data: nonce,
        },
        logging: false,
      }
    );
  }

  return {
    message: `Found ${transactions.length} transactions`,
    event,
  };
};
