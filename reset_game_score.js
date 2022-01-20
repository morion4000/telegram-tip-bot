require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

const bot = new TelegramBot(config.telegram.token, {
  polling: false,
});

const user = '528354447';
const message = '780032';
const score = 1;

bot
  .setGameScore(user, score, {
    chat_id: user,
    message_id: message,
    force: true,
  })
  .then(console.log)
  .catch(console.log);
