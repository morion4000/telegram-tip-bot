require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const user = require('./models').user;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function () {
  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
    polling: false,
  });

  let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  resp += ' \t ✅ Added a 24 hour wait period for withdraws. \n\n';
  resp +=
    ' \t ✅ Created a cold storage wallet `WEBD$gCpXBKwTGPJ+A2HpEAN6FPsJaBPTtCzeez$` to increase security. \n\n';
  resp +=
    ' \t ✅ Launched the 👻 Haunted Tower /game. Find out more in the dedicated channel: https://t.me/hauntedtower. \n\n';
  resp +=
    '*Try it out*: run /game in a group to compete against other players and earn rewards.';

  const found_users = await user.model.findAll();
  let sent_to_users = 0;

  for (const found_user of found_users) {
    if (!found_user.telegram_id) {
      continue;
    }

    // only me (@morion4000)
    if (found_user.telegram_id !== '528354447') {
      // continue;
    }

    console.log(found_user.id, found_user.telegram_username);

    //continue;

    try {
      await bot.sendPhoto(
        found_user.telegram_id,
        'https://web.hauntedtower.com/assets/game/logo/telegram_banner.png',
        {
          //caption: 'No-loss /lottery. Weekly prizes.',
        }
      );

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
    await sleep(2000);
  }
})();
