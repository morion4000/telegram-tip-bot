var user = require('./../models').user.model,
  coin = require('./../models').coin.model,
  config = require('./../config'),
  numeral = require('numeral'),
  _ = require('underscore'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return async function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text);

      if (msg.chat.type !== 'private') {
        resp =
          'Private command. Please DM the bot: @webdollar_tip_bot to use the command.';

        await bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      if (!msg.from.username) {
        resp =
          'Please set an username for your Telegram account to use the bot.';

        await bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      const found_user = await user.findOne({
        where: {
          [Sequelize.Op.or]: [
            {
              telegram_id: msg.from.id,
            },
            {
              telegram_username: msg.from.username,
            },
          ],
        },
      });

      const webdollar = await coin.findOne({
        where: {
          ticker: 'WEBD',
        },
      });

      if (!webdollar) {
        throw new Error('Coin not found');
      }

      const balance_usd = parseFloat(found_user.balance * webdollar.price_usd);

      if (found_user) {
        resp =
          '💰 Balance: *' +
          numeral(found_user.balance).format('0,0') +
          '* WEBD (' +
          numeral(balance_usd).format('0,0') +
          ' USD). Receiving /staking rewards @ *' +
          config.staking.yearly_percentage +
          '%* per year.\n\n';
        resp += '💵 You can add more funds using /topup.';
      } else {
        resp = 'Your user can not be found. Create a new acount /start';
      }

      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    } catch (e) {
      console.error('/balance', e);

      await bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
