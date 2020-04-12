var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function(bot) {
  return function(msg, match) {
    console.log(msg.text);
    
    bot.sendPhoto(msg.chat.id, 'http://www.dorinalexandrescu.ro/blog/wp-content/uploads/2012/02/filantropica-mana-intinsa-300x300.jpg', {
      caption: 'O mana intinsa trebuie sa spuna o poveste!'
    });
  };
};

module.exports = Command;
