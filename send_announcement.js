var user = require('./models').user,
  config = require('./config'),
  TelegramBot = require('node-telegram-bot-api'),
  _ = require('underscore');

var bot = new TelegramBot(config.telegram.token, {
  polling: false,
});

//var resp = '🆕 *Announcement*: The bot has been updated to include fees for tipping and withdrawal of funds. A new command /fees has been implemented to see what the fees are.';
//var resp = '🆕 *The bot has been updated*\n\n';
//resp += ' \t - tipping fees have been removed\n';
//resp += ' \t - new command /price has been implemented to see the WEBD price and volume';

//var resp = '🆕 *The bot has been updated:*\n\n';
//resp += ' \t - your withdraws are processed automatically\n';
//resp += ' \t - the withdraw fee and mininum amount was decreased to 10 WEBD\n';
//resp += ' \t - you can withdraw a custom amount\n';

//var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
// resp += ' \t ✅ You are going to earn more by staking with the bot. Rewards have been increased from 6% to *18%* per year to celebrate POS90 🥳\n\n';
// resp += ' \t ✅ You can start staking with less. The minimum /tipbalance required for staking has been lowered from 6000 to 2000 WEBD 🤯\n\n';
// resp += '*Try it out*: run /staking to see your earnings, and /deposit to add funds.';

// var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
// resp += '💵 You are now able to purchase WEBD instantly from the bot with your card, Apple or Google Pay.\n\n';
// resp += '*Try it out*: run /topup to see the available packages.';

// var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
// resp +=
//   ' \t ✅ Staking rewards have been increased to up to *25%* per year 🥳. Based on your /tipbalance the following rates apply:\n\n';
// resp += ' \t\t 💰 More than 10,000 WEBD          ➡️ *15%* per year\n';
// resp += ' \t\t 💰 More than 1,000,000 WEBD     ➡️ *20%* per year\n';
// resp += ' \t\t 💰 More than 10,000,000 WEBD   ➡️ *25%* per year\n\n';
// resp +=
//   ' \t ✅ The minimum /tipbalance required for staking has been increased to 10,000 WEBD \n\n';
// resp +=
//   '*Try it out*: run /staking to see your earnings, and /deposit or /topup to add funds.';

// var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
// resp +=
//   ' \t ✅ Staking rewards have been increased to *25%* per year for all users 🎅 \n\n';
// resp +=
//   ' \t ✅ The minimum /tipbalance required for staking has been lowered to 1500 WEBD 🥳 \n\n';
// resp +=
//   ' \t ✅ Users are going to receive daily notifications when staking rewards are sent \n\n';
// resp +=
//   '*Try it out*: run /staking to see your earnings, and /deposit to add funds.';

// var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
// resp +=
//   ' \t ✅ The minimum staking amount has been lowered. Users can now stake with *1 WEBD* \n\n';
// resp +=
//   '*Try it out*: run /staking to see your earnings, and /deposit to add funds.';

var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
resp +=
  '\t ✅ You are now able to purchase WEBD instantly from the bot with your card or PayPal 💵💵💵 \n\n';
resp += '\t ✅ The bot is now in the top 10 daily miners 🚀🚀🚀 \n\n';
resp += '*Try it out*: run /topup to see the available packages.';

var resp = '*@webdollar_tip_bot bot has been updated:*\n\n';
resp +=
  '\t ✅ Bug fix for users that change the Telegram username \n\n';
resp += '\t ✅ Prices reported by the /price command are sourced from CoinMarketCap \n\n';
resp += '\t ✅ Discounted prices for buying WEBD using 💳  or PayPal account via /topup 💰💰💰 \n\n';

user.model.findAll().then(async function (found_users) {
  var sent_to_users = 0;

  for (var i = 0; i < found_users.length; i++) {
    var found_user = found_users[i];

    if (!found_user.telegram_id) {
      continue;
    }

    // only me (@morion4000)
    if (found_user.telegram_id !== '528354447') {
      //continue;
    }

    console.log(found_user.id, found_user.telegram_username);

    //continue;

    try {
      await bot.sendMessage(found_user.telegram_id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });

      // await bot.sendPhoto(
      //   found_user.telegram_id,
      //   'https://pay.hostero.eu/top-10-miners.png',
      //   {
      //     caption: 'Buy WEBD with card or PayPal via /topup',
      //   }
      // );

      // await bot.sendPhoto(
      //   found_user.telegram_id,
      //   'https://pay.hostero.eu/hostero-pay.png',
      //   {
      //     caption: 'Top 10 daily miners',
      //   }
      // );

      sent_to_users++;
    } catch (error) {
      console.error(error.message || error);
    }

    console.log('found users', found_users.length);
    console.log('sent to users', sent_to_users);
  }
});
