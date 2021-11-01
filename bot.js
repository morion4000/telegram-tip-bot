require('dotenv').config();

const _ = require('underscore');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const commands = require('./commands');
const sequelize = require('./models').sequelize;
const { update_username } = require('./utils');

sequelize
  .sync({
    //force: true
  })
  .then(function () {
    console.log('Db synced');
  });

// Create a bot that uses 'polling' to fetch new updates
var bot = new TelegramBot(config.telegram.token, {
  polling: true,
});

var start_command = commands.start(bot);
var tip_empty_command = commands.tip_empty(bot);
var tip_command = commands.tip(bot);
var balance_command = commands.balance(bot);
var deposit_command = commands.deposit(bot);
var withdraw_command = commands.withdraw(bot);
var withdraw_empty_command = commands.withdraw_empty(bot);
var transactions_command = commands.transactions(bot);
var wallet_command = commands.wallet(bot);
var setwallet_command = commands.setwallet(bot);
var setwallet_empty_command = commands.setwallet_empty(bot);
var nam_command = commands.nam(bot);
var filantropica_command = commands.filantropica(bot);
var help_command = commands.help(bot);
var fees_command = commands.fees(bot);
var price_command = commands.price(bot);
var staking_command = commands.staking(bot);
var system_command = commands.system(bot);
var stats_command = commands.stats(bot);
var scoreboard_command = commands.scoreboard(bot);
var topup_command = commands.topup(bot);
var tutorial_command = commands.tutorial(bot);
var lottery_command = commands.lottery(bot);
var lottery_tickets_command = commands.lottery_tickets(bot);
var lottery_deposit_command = commands.lottery_deposit(bot);
var lottery_withdraw_command = commands.lottery_withdraw(bot);
var lottery_faq_command = commands.lottery_faq(bot);
var lottery_history_command = commands.lottery_history(bot);

// Middleware
bot.on('message', async (msg) => {
  // FIXME: Possibly only run update_username for msg.chat.type === private (less events)
  try {
    await update_username(msg.from);
  } catch (error) {
    console.error(error);
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
bot.onText(/\/lottery_tickets$/, lottery_tickets_command);
bot.onText(/\/lottery_deposit$/, lottery_deposit_command);
bot.onText(/\/lottery_deposit [0-9]+$/, lottery_deposit_command);
bot.onText(/\/lottery_withdraw$/, lottery_withdraw_command);
bot.onText(/\/lottery_withdraw [0-9]+$/, lottery_withdraw_command);
bot.onText(/\/lottery_faq$/, lottery_faq_command);
bot.onText(/\/lottery_history$/, lottery_history_command);

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
bot.onText(/\/lottery_tickets@webdollar_tip_bot$/, lottery_tickets_command);
bot.onText(/\/lottery_deposit@webdollar_tip_bot$/, lottery_deposit_command);
bot.onText(/\/lottery_deposit@webdollar_tip_bot [0-9]+$/, lottery_deposit_command);
bot.onText(/\/lottery_withdraw@webdollar_tip_bot$/, lottery_withdraw_command);
bot.onText(/\/lottery_withdraw@webdollar_tip_bot [0-9]+$/, lottery_withdraw_command);
bot.onText(/\/lottery_faq@webdollar_tip_bot$/, lottery_faq_command);
bot.onText(/\/lottery_history@webdollar_tip_bot$/, lottery_history_command);
