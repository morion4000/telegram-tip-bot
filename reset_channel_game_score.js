require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

const bot = new TelegramBot(config.telegram.token, {
  polling: false,
});

const user = '528354447'; // morion4000
// const message = '8468'; // hauntedtower channel
const message = '594689'; // webdollar channel
// const chat = '-1001510982248'; // hauntedtower channel
const chat = '-1001347111227'; // webdollar channel

async function run() {
  const scores = await bot.getGameHighScores(user, {
    chat_id: chat,
    message_id: message,
  });

  for (const score of scores) {
    console.log(
      `${score.position}\t${score.user.id} (${score.user.username})\t\t\t${score.score}`
    );

    // continue;

    try {
      await bot.setGameScore(score.user.id, 0, {
        chat_id: chat,
        message_id: message,
        force: true,
      });
    } catch (error) {
      console.error(error.message);
    }
  }
}

run();
