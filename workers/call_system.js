var TelegramBot = require('node-telegram-bot-api');
var config = require('../config');
var commands = require('../commands');

var bot = new TelegramBot(config.telegram.token, {
  polling: false,
});

var system_command = commands.system(bot);

console.log('started worker');

setTimeout(function () {
  process.exit(1);
}, 60 * 1000); // 1 minutes

system_command({
  text: '/system auto',
  chat: {
    id: config.admin.telegram_chat_id,
  },
  from: {
    username: config.admin.telegram_username,
  },
});
