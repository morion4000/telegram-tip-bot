const coin_model = require('../models').coin.model;
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const KEY = process.env.COINMARKETCAP_KEY || '';
const CM_URL =
  'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=webd';
const AXIOS_TIMEOUT = 10000;

// https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyQuotesLatest
exports.handler = async function (event) {
  try {
    const options = {
      timeout: AXIOS_TIMEOUT,
      headers: {
        'X-CMC_PRO_API_KEY': KEY,
      },
    };
    const coin_properties = {};

    // FIXME: API doesn't allow multiple convert values in one call
    const responses = await Promise.all([
      axios.get(`${CM_URL}&convert=usd`, options),
      axios.get(`${CM_URL}&convert=eur`, options),
      axios.get(`${CM_URL}&convert=btc`, options),
      axios.get(`${CM_URL}&convert=eth`, options),
    ]);

    for (const { data } of responses) {
      const { quote } = data.data.WEBD;

      if ('USD' in quote) {
        coin_properties.price_usd = quote.USD.price;
        coin_properties.volume_daily_total_usd = quote.USD.volume_24h;
        coin_properties.market_cap_usd = quote.USD.market_cap;
      }

      if ('EUR' in quote) {
        coin_properties.price_eur = quote.EUR.price;
      }

      if ('BTC' in quote) {
        coin_properties.price_btc = quote.BTC.price;
      }

      if ('ETH' in quote) {
        coin_properties.price_eth = quote.ETH.price;
      }
    }

    console.log(coin_properties);

    await coin_model.update(coin_properties, {
      where: {
        ticker: 'WEBD',
      },
      logging: false,
    });
  } catch (error) {
    console.error(error);
  }

  return {
    message: null,
    event,
  };
};
