var config = require('./../config'),
  _ = require('underscore'),
  request = require('request'),
  crequest = require('cached-request')(request),
  coingecko_api_url = 'https://api.coingecko.com/api/v3/coins/',
  api_url_postfix = '?market_data=true&community_data=false&developer_data=false';

var Command = function(bot) {
  crequest.setCacheDirectory('tmp');

  return function(msg, match) {
    try {
      var resp = '';
      var url = coingecko_api_url + 'webdollar' + api_url_postfix;

      console.log(msg.text);

      crequest({
        url: url,
        ttl: 3600 * 1000 // 1h
      }, function (err, response, body) {
        if (err) {
          console.error(err);
          return;
        }

        var data = JSON.parse(body);

        if (data.error) {
          console.error(data.error);
          return;
        }

        resp = 'Price: $' + data.market_data.current_price.usd + '\n';
        resp += 'BTC: ' + data.market_data.current_price.btc.toFixed(10) + '\n';
        resp += 'ETH: ' + data.market_data.current_price.eth.toFixed(10) + '\n\n';
        resp += '24hr High: $' + data.market_data.high_24h.usd + '\n';
        resp += '24hr Low: $' + data.market_data.low_24h.usd + '\n';
        resp += '24hr Volume: $' + data.market_data.total_volume.usd + '\n';

        bot.sendMessage(msg.chat.id, resp, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });
      });
    } catch(e) {
      console.error('/price', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
