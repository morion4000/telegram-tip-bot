const transaction_model = require('./../models').transaction.model;
const config = require('./../config');
const axios = require('axios');

const url = `https://webdollar.network:5001/trx?page_number=1&miner=${encodeURIComponent(
  config.vault
)}`;

exports.handler = async function (event) {
  const response = await axios.get(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  const transactions = response.data.trxs;

  console.log('found transactions', transactions.length);

  for (const transaction of transactions) {
    if (transaction.to.address.length > 1) {
      continue;
    }

    if (transaction.from.address.length > 1) {
      continue;
    }

    if (transaction.to.address[0] !== config.vault) {
      continue;
    }

    var amount = transaction.to_amount / 10000;
    var wallet = transaction.from.address[0];

    console.log(
      'found transaction',
      transaction._id,
      'amount',
      amount,
      'to',
      wallet
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
          // FIXME: Need to narrow down the search more...
          //extra_data: nonce,
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
