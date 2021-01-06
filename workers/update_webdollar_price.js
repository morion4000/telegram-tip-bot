const coin_model = require('./../models').coin.model;
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const WEBD_TICKER = 'WEBD';
const CG_URL =
  'https://api.coingecko.com/api/v3/coins/webdollar?market_data=true&community_data=false&developer_data=false';
const AXIOS_TIMEOUT = 3000;

exports.handler = async function (event) {
  try {
    const { data } = await axios.get(CG_URL, { timeout: AXIOS_TIMEOUT });

    console.log(data.market_data);

    if (!data || !data.market_data) {
      throw new Error(`Couldn't get data`);
    }

    const {
      current_price,
      high_24h,
      low_24h,
      total_volume,
      market_cap,
    } = data.market_data;

    await coin_model.update(
      {
        price_usd: current_price.usd,
        price_eur: current_price.eur,
        price_btc: current_price.btc,
        price_eth: current_price.eth,
        volume_daily_high_usd: high_24h.usd,
        volume_daily_low_usd: low_24h.usd,
        volume_daily_total_usd: total_volume.usd,
        market_cap_usd: market_cap.usd,
      },
      {
        where: {
          ticker: WEBD_TICKER,
        },
        logging: false,
      }
    );
  } catch (error) {
    console.error(error.message);
  }

  return {
    message: null,
    event,
  };
};
