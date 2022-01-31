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

  //let resp = '🆕 *Announcement*: The bot has been updated to include fees for tipping and withdrawal of funds. A new command /fees has been implemented to see what the fees are.';
  //let resp = '🆕 *The bot has been updated*\n\n';
  //resp += ' \t - tipping fees have been removed\n';
  //resp += ' \t - new command /price has been implemented to see the WEBD price and volume';

  //let resp = '🆕 *The bot has been updated:*\n\n';
  //resp += ' \t - your withdraws are processed automatically\n';
  //resp += ' \t - the withdraw fee and mininum amount was decreased to 10 WEBD\n';
  //resp += ' \t - you can withdraw a custom amount\n';

  //let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp += ' \t ✅ You are going to earn more by staking with the bot. Rewards have been increased from 6% to *18%* per year to celebrate POS90 🥳\n\n';
  // resp += ' \t ✅ You can start staking with less. The minimum /tipbalance required for staking has been lowered from 6000 to 2000 WEBD 🤯\n\n';
  // resp += '*Try it out*: run /staking to see your earnings, and /deposit to add funds.';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp += '💵 You are now able to purchase WEBD instantly from the bot with your card, Apple or Google Pay.\n\n';
  // resp += '*Try it out*: run /topup to see the available packages.';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp +=
  //   ' \t ✅ Staking rewards have been increased to up to *25%* per year 🥳. Based on your /tipbalance the following rates apply:\n\n';
  // resp += ' \t\t 💰 More than 10,000 WEBD          ➡️ *15%* per year\n';
  // resp += ' \t\t 💰 More than 1,000,000 WEBD     ➡️ *20%* per year\n';
  // resp += ' \t\t 💰 More than 10,000,000 WEBD   ➡️ *25%* per year\n\n';
  // resp +=
  //   ' \t ✅ The minimum /tipbalance required for staking has been increased to 10,000 WEBD \n\n';
  // resp +=
  //   '*Try it out*: run /staking to see your earnings, and /deposit or /topup to add funds.';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp +=
  //   ' \t ✅ Staking rewards have been increased to *25%* per year for all users 🎅 \n\n';
  // resp +=
  //   ' \t ✅ The minimum /tipbalance required for staking has been lowered to 1500 WEBD 🥳 \n\n';
  // resp +=
  //   ' \t ✅ Users are going to receive daily notifications when staking rewards are sent \n\n';
  // resp +=
  //   '*Try it out*: run /staking to see your earnings, and /deposit to add funds.';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp +=
  //   ' \t ✅ The minimum staking amount has been lowered. Users can now stake with *1 WEBD* \n\n';
  // resp +=
  //   '*Try it out*: run /staking to see your earnings, and /deposit to add funds.';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp +=
  //   '\t ✅ You are now able to purchase WEBD instantly from the bot with your card or PayPal 💵💵💵 \n\n';
  // resp += '\t ✅ The bot is now in the top 10 daily miners 🚀🚀🚀 \n\n';
  // resp += '*Try it out*: run /topup to see the available packages.';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp +=
  //   '\t ✅ Bug fix for users that change the Telegram username \n\n';
  // resp += '\t ✅ Prices reported by the /price command are sourced from CoinMarketCap \n\n';
  // resp += '\t ✅ Discounted prices for buying WEBD using 💳  or PayPal account via /topup 💰💰💰 \n\n';

  // let resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
  // resp +=
  //   '\t ✅ You are now able to /topup WEBD again from the bot with your card or PayPal (only small amounts for now)💰💰💰 \n\n';
  // resp += '\t ✅ You can /tip USD amounts (the amount gets converted to WEBD at the current price) 💵💵💵 \n\n';
  // resp += '*Try it out*: run `/tip @morion4000 $1` to test it out';

  // let resp = '*@webdollar_tip_bot /lottery has launched* 🚀\n\n';
  // resp +=
  //   '\t ✅ *No-loss*. You are participating in the lottery with your /staking rewards. \n\n';
  // resp += '\t ✅ *Weekly prize*. The winner is selected every week. \n\n';
  // resp +=
  //   '\t ✅ *Transparent draw*. The winner selection process is done using the WebDollar blockchain. \n\n';

  // resp +=
  //   '*Try it out*: run `/lotterydeposit 1000` to receive tickets for the current round';

  // let resp = '*👻 Haunted Tower /game has launched*\n\n';
  // resp +=
  //   '\t ✅ *Rewards*. You are receiving WEBD each time you get a new highscore. \n\n';
  // resp +=
  //   '\t ✅ *Compete*. Top players for each group are shown publicly. \n\n';
  // resp += '\t ✅ *Fun*. Play a Tower Defense game focused on strategy. \n\n';
  // resp +=
  //   '*Try it out*: run /game in a group to compete against other players and earn rewards.';

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
