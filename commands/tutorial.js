var Command = function (bot) {
  return function (msg, match) {
    console.log(msg.text);

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
