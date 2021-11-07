var user = require('./../models').user.model,
  config = require('./../config'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return async function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text, msg.chat.id);

      if (
        msg.chat.type !== 'private' &&
        !config.public_channels.includes(msg.chat.id)
      ) {
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
          'Please set an username for your telegram account to use the bot.';

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
      
      if (found_user) {
        var wallet = found_user.wallet || 'None';

        resp =
          '💰 You set the following wallet: `' +
          wallet +
          '`\n\nℹ️ Use /setwallet to change it.';
      } else {
        resp = 'Your user can not be found. Create a new acount /start';
      }

      await bot.sendMessage(msg.chat.id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });

      // await bot.sendPhoto(
      //   msg.chat.id,
      //   'https://www.hostero.eu/assets/img/tipbot/wallet_command.jpg'
      // );
    } catch (e) {
      console.error('/wallet', e);

      await bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
