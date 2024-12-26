require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { or } = require('sequelize');
const _ = require('underscore');
const user = require('./models').user;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function () {
  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
    polling: false,
  });

  let resp =
    '*@webdollar_tip_bot has disabled staking and deposits*. Please withdraw your coins from the bot before *December 1st 2023*.\n\n';

  const found_users = await user.model.findAll();
  const ordered_users = found_users.sort((a, b) => b.balance - a.balance);
  let sent_to_users = 0;
  let i = 0;

  for (const found_user of ordered_users) {
    if (!found_user.telegram_id) {
      continue;
    }

    if (found_user.balance < 500) {
      continue;
    }

    i++;

    if (i < 1420) {
      continue;
    }

    // only me (@morion4000)
    if (found_user.telegram_id !== '528354447') {
      //   continue;
    }

    console.log(i, found_user.id, found_user.telegram_username);

    //continue;

    try {
      await bot.sendMessage(found_user.telegram_id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });

      sent_to_users++;
    } catch (error) {
      console.error(error.message || error);
    }

    console.log(`sent to users: ${sent_to_users}/${found_users.length}`);

    // To avoid getting blocked by Telegram
    // https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
    await sleep(1000);
  }
})();
