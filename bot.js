require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const commands = require('./commands');
// const sequelize = require('./models').sequelize;
const { Activity } = require('./services/activity');
const { update_username } = require('./utils');

// sequelize
//   .sync({
//     //force: true
//   })
//   .then(function () {
//     console.log('Db synced');
//   });

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.telegram.token, {
  polling: true,
});

const activity = new Activity();

// To clear activity backlog
activity.watch();

const start_command = commands.start(bot);
const tip_empty_command = commands.tip_empty(bot);
const tip_command = commands.tip(bot);
const rain_command = commands.rain(bot, activity);
const balance_command = commands.balance(bot);
const deposit_command = commands.deposit(bot);
const withdraw_command = commands.withdraw(bot);
const withdraw_empty_command = commands.withdraw_empty(bot);
const transactions_command = commands.transactions(bot);
const wallet_command = commands.wallet(bot);
const setwallet_command = commands.setwallet(bot);
const setwallet_empty_command = commands.setwallet_empty(bot);
const nam_command = commands.nam(bot);
const filantropica_command = commands.filantropica(bot);
const help_command = commands.help(bot);
const fees_command = commands.fees(bot);
const price_command = commands.price(bot);
const staking_command = commands.staking(bot);
const system_command = commands.system(bot);
const stats_command = commands.stats(bot);
const scoreboard_command = commands.scoreboard(bot);
const topup_command = commands.topup(bot);
const tutorial_command = commands.tutorial(bot);
const lottery_command = commands.lottery(bot);
const lotterytickets_command = commands.lotterytickets(bot);
const lotterydeposit_command = commands.lotterydeposit(bot);
const lotterywithdraw_command = commands.lotterywithdraw(bot);
const lotteryfaq_command = commands.lotteryfaq(bot);
const lotteryhistory_command = commands.lotteryhistory(bot);

// Middleware
bot.on('message', async (msg) => {
  // FIXME: Possibly only run update_username for msg.chat.type === private (less events)
  try {
    await update_username(msg.from);
  } catch (error) {
    console.error(error);
  }

  // Do not log activity with bot in private (only channels)
  if (msg.chat && msg.chat.type && msg.chat.type !== 'private') {
    //console.log(msg.chat);

    activity.add(msg.chat.id, msg.from.id, msg.from.username);

    console.log(
      `[ACTIVITY] New event (size: ${activity.size}, channels: ${activity.channels})`
    );
  }

  // For debugging
  // console.log(msg);
});

bot.onText(/\/tip$/, tip_empty_command);
bot.onText(/\/tip \w+$/, tip_empty_command);
bot.onText(/\/tip @\w+$/, tip_empty_command);
bot.onText(/\/tip \w+$/, tip_empty_command);
bot.onText(/\/tip \w+ [0-9]+$/, tip_empty_command);

bot.onText(/\/tip@webdollar_tip_bot$/, tip_empty_command);
bot.onText(/\/tip@webdollar_tip_bot \w+$/, tip_empty_command);
bot.onText(/\/tip@webdollar_tip_bot @\w+$/, tip_empty_command);
bot.onText(/\/tip@webdollar_tip_bot \w+$/, tip_empty_command);
bot.onText(/\/tip@webdollar_tip_bot \w+ [0-9]+$/, tip_empty_command);

bot.onText(/\/tip @\w+ \w+$/, tip_command);
bot.onText(/\/tip @\w+ \w+ webd$/, tip_command);
bot.onText(/\/tip @\w+  \w+$/, tip_command);
bot.onText(/\/tip @\w+ \$\w+$/, tip_command);
bot.onText(/\/tip @\w+  \$\w+$/, tip_command);

bot.onText(/\/tip@webdollar_tip_bot @\w+ \w+$/, tip_command);
bot.onText(/\/tip@webdollar_tip_bot @\w+ \w+ webd$/, tip_command);
bot.onText(/\/tip@webdollar_tip_bot @\w+  \w+$/, tip_command);
bot.onText(/\/tip@webdollar_tip_bot @\w+ \$\w+$/, tip_command);
bot.onText(/\/tip@webdollar_tip_bot @\w+  \$\w+$/, tip_command);

bot.onText(/\/rain$/, rain_command);
bot.onText(/\/rain [0-9]+$/, rain_command);
bot.onText(/\/start$/, start_command);
bot.onText(/\/tipbalance$/, balance_command);
bot.onText(/\/deposit$/, deposit_command);
bot.onText(/\/withdraw$/, withdraw_empty_command);
bot.onText(/\/withdraw [0-9]+$/, withdraw_command);
bot.onText(
  /\/withdraw [0-9]+ WEBD\$[a-km-zA-NP-Z0-9+@#$]{33,34}\$$/,
  withdraw_command
);
bot.onText(/\/transactions$/, transactions_command);
bot.onText(/\/wallet$/, wallet_command);
bot.onText(/\/setwallet$/, setwallet_empty_command);
bot.onText(
  /\/setwallet WEBD\$[a-km-zA-NP-Z0-9+@#$]{33,34}\$$/,
  setwallet_command
);
bot.onText(/\/filantropica$/, filantropica_command);
bot.onText(/\/nam$/, nam_command);
bot.onText(/\/help$/, help_command);
bot.onText(/\/fees$/, fees_command);
bot.onText(/\/price$/, price_command);
bot.onText(/\/price [0-9]+$/, price_command);
bot.onText(/\/staking$/, staking_command);
bot.onText(/\/system$/, system_command);
bot.onText(/\/stats$/, stats_command);
bot.onText(/\/scoreboard$/, scoreboard_command);
bot.onText(/\/topup$/, topup_command);
bot.onText(/\/tutorial$/, tutorial_command);
bot.onText(/\/lottery$/, lottery_command);
bot.onText(/\/lotterytickets$/, lotterytickets_command);
bot.onText(/\/lotterydeposit$/, lotterydeposit_command);
bot.onText(/\/lotterydeposit [0-9]+$/, lotterydeposit_command);
bot.onText(/\/lotterywithdraw$/, lotterywithdraw_command);
bot.onText(/\/lotterywithdraw [0-9]+$/, lotterywithdraw_command);
bot.onText(/\/lotteryfaq$/, lotteryfaq_command);
bot.onText(/\/lotteryhistory$/, lotteryhistory_command);

bot.onText(/\/rain@webdollar_tip_bot$/, rain_command);
bot.onText(/\/rain@webdollar_tip_bot [0-9]+$/, rain_command);
bot.onText(/\/start@webdollar_tip_bot$/, start_command);
bot.onText(/\/tipbalance@webdollar_tip_bot$/, balance_command);
bot.onText(/\/deposit@webdollar_tip_bot$/, deposit_command);
bot.onText(/\/withdraw@webdollar_tip_bot$/, withdraw_empty_command);
bot.onText(/\/withdraw@webdollar_tip_bot [0-9]+$/, withdraw_command);
bot.onText(
  /\/withdraw@webdollar_tip_bot [0-9]+ WEBD\$[a-km-zA-NP-Z0-9+@#$]{33,34}\$$/,
  withdraw_command
);
bot.onText(/\/transactions@webdollar_tip_bot$/, transactions_command);
bot.onText(/\/wallet@webdollar_tip_bot$/, wallet_command);
bot.onText(/\/setwallet@webdollar_tip_bot$/, setwallet_empty_command);
bot.onText(
  /\/setwallet@webdollar_tip_bot WEBD\$[a-km-zA-NP-Z0-9+@#$]{33,34}\$$/,
  setwallet_command
);
bot.onText(/\/filantropica@webdollar_tip_bot$/, filantropica_command);
bot.onText(/\/nam@webdollar_tip_bot$/, nam_command);
bot.onText(/\/help@webdollar_tip_bot$/, help_command);
bot.onText(/\/fees@webdollar_tip_bot$/, fees_command);
bot.onText(/\/price@webdollar_tip_bot$/, price_command);
bot.onText(/\/price@webdollar_tip_bot [0-9]+$/, price_command);
bot.onText(/\/staking@webdollar_tip_bot$/, staking_command);
bot.onText(/\/system@webdollar_tip_bot$/, system_command);
bot.onText(/\/stats@webdollar_tip_bot$/, stats_command);
bot.onText(/\/scoreboard@webdollar_tip_bot$/, scoreboard_command);
bot.onText(/\/toptup@webdollar_tip_bot$/, topup_command);
bot.onText(/\/tutorial@webdollar_tip_bot$/, tutorial_command);
bot.onText(/\/lottery@webdollar_tip_bot$/, lottery_command);
bot.onText(/\/lotterytickets@webdollar_tip_bot$/, lotterytickets_command);
bot.onText(/\/lotterydeposit@webdollar_tip_bot$/, lotterydeposit_command);
bot.onText(
  /\/lotterydeposit@webdollar_tip_bot [0-9]+$/,
  lotterydeposit_command
);
bot.onText(/\/lotterywithdraw@webdollar_tip_bot$/, lotterywithdraw_command);
bot.onText(
  /\/lotterywithdraw@webdollar_tip_bot [0-9]+$/,
  lotterywithdraw_command
);
bot.onText(/\/lotteryfaq@webdollar_tip_bot$/, lotteryfaq_command);
bot.onText(/\/lotteryhistory@webdollar_tip_bot$/, lotteryhistory_command);
