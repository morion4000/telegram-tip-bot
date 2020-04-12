var user = require('./../models').user,
  config = require('./../config'),
  TelegramBot = require('node-telegram-bot-api'),
  _ = require('underscore');

var bot = new TelegramBot(config.telegram.token, {
  polling: false
});

//var resp = '🆕 *Announcement*: The bot has been updated to include fees for tipping and withdrawal of funds. A new command /fees has been implemented to see what the fees are.';
//var resp = '🆕 *The bot has been updated*\n\n';
//resp += ' \t - tipping fees have been removed\n';
//resp += ' \t - new command /price has been implemented to see the WEBD price and volume';

var resp = '🆕 *The bot has been updated:*\n\n';
resp += ' \t - your withdraws are processed automatically\n';
resp += ' \t - the withdraw fee and mininum amount was decreased to 10 WEBD\n';
resp += ' \t - you can withdraw a custom amount\n';

user.model.findAll()
  .then(function(found_users) {
    console.log('found users', found_users.length);

    for (var i = 0; i < found_users.length; i++) {
      var found_user = found_users[i];

      if (!found_user.telegram_id) {
        continue;
      }

      if (found_user.telegram_id !== '528354447') {
        //continue;
      }

      console.log(found_user.id);

      //continue;

      bot.sendMessage(found_user.telegram_id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  });
