const coin_model = require('./../models').coin.model;
const config = require('./../config');
const numeral = require('numeral');

var Command = function (bot) {
  return async function (msg, match) {
    try {
      const amount_match = msg.text.match(/ [0-9]+/);
      let resp = '';

      console.log(msg.text, msg.chat.id);

      const webdollar = await coin_model.findOne({
        where: {
          ticker: 'WEBD',
        },
      });

      if (!webdollar) {
        throw new Error('Coin not found');
      }

      if (amount_match === null) {
        resp =
          '1,000,000 WEBD ➡️ **$' +
          parseInt(webdollar.price_usd * 1000000) +
          '**\n\n';
        resp += '▫️ USD: ' + webdollar.price_usd.toFixed(10) + '\n';
        resp += '▫️ BTC: ' + webdollar.price_btc.toFixed(10) + '\n';
        resp += '▫️ ETH: ' + webdollar.price_eth.toFixed(10) + '\n\n';
        //resp += '24hr High: $' + webdollar.volume_daily_high_usd + '\n';
        //resp += '24hr Low: $' + webdollar.volume_daily_low_usd + '\n';
        resp +=
          '24hr Volume: $' + parseInt(webdollar.volume_daily_total_usd) + ' ';
        resp += '([source](https://www.coingecko.com/en/coins/webdollar))\n';
      } else {
        const amount = parseInt(amount_match[0]) || 0;
        const amount_usd = parseFloat(amount * webdollar.price_usd);

        resp = `${numeral(amount).format('0,0')} WEBD ➡️ $${numeral(
          amount_usd
        ).format('0,0.00')}`;
      }

      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });

      if (msg.chat.type === 'private') {
        await bot.sendPhoto(
          msg.chat.id,
          'https://www.hostero.eu/assets/img/tipbot/price_command.jpg'
        );
      }
    } catch (e) {
      console.error('/price', e);

      await bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
