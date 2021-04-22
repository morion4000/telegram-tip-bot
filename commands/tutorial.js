var Command = function (bot) {
  return async function (msg, match) {
    var resp = '';

    console.log(msg.text, msg.chat.id);

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

    // TODO: Look into bot.sendMediaGroup(msg.chat.id);
    // SEE: https://github.com/yagop/node-telegram-bot-api/blob/master/src/telegram.js#L2160

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/howtocreatewallet.jpg',
      {
        caption: 'How to create a wallet on webdollar.io',
      }
    );

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/howtopasswordwallet.jpg',
      {
        caption: 'How to protect a wallet on webdollar.io',
      }
    );

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/howtoimportwallet.jpg',
      {
        caption: 'How to import a wallet on webdollar.io',
      }
    );

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/howtomine.jpg',
      {
        caption: 'How to mine on webdollar.io',
      }
    );

    bot.sendPhoto(
      msg.chat.id,
      'https://www.hostero.eu/assets/img/tipbot/howtotransfer.jpg',
      {
        caption: 'How to make a transfer on webdollar.io',
      }
    );
  };
};

module.exports = Command;
