var coin = require('./../models').coin.model,
  config = require('./../config');

var Command = function (bot) {
  return async function (msg, match) {
    try {
      let resp = '';

      console.log(msg.text);

      const webdollar = await coin.findOne({
        where: {
          ticker: 'WEBD',
        },
      });

      if (!webdollar) {
        throw new Error('Coin not found');
      }

      resp =
        '1,000,000 WEBD ➡️ $' +
        parseInt(webdollar.price_usd * 1000000) +
        '\n\n';
      resp += 'USD: ' + webdollar.price_usd.toFixed(10) + '\n';
      resp += 'BTC: ' + webdollar.price_btc.toFixed(10) + '\n';
      resp += 'ETH: ' + webdollar.price_eth.toFixed(10) + '\n\n';
      resp += '24hr High: $' + webdollar.volume_daily_high_usd + '\n';
      resp += '24hr Low: $' + webdollar.volume_daily_low_usd + '\n';
      resp += '24hr Volume: $' + webdollar.volume_daily_total_usd + '\n';

      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    } catch (e) {
      console.error('/price', e);

      await bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
