var user = require('./../models').user,
  config = require('./../config'),
  _ = require('underscore');

var Command = function(bot) {
  return function(msg, match) {
    var resp = '⚙️ You can run the following commands: \n\n';

    console.log(msg.text);

    resp += '\t /help - Shows the help message \n';
    resp += '\t /tip @user 1000 - Tip the user with the specified amount \n';
    resp += '\t /tipbalance - Shows your balance \n';
    resp += '\t /wallet - Shows your WEBD wallet for deposits and withdrawals \n';
    resp += '\t /setwallet WALLET - Set your WEBD wallet for deposits and withdrawals \n';
    resp += '\t /deposit - Deposit funds to your account \n';
    resp += '\t /withdraw - Withdraw funds to a WEBD address \n';
    resp += '\t /transactions - Shows the transactions for your account \n';
    resp += '\t /fees - Shows the fees \n';
    resp += '\t /price - Shows the price and volume for WEBD \n';
    resp += '\t /staking - Shows the staking rewards received \n';

    bot.sendMessage(msg.chat.id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  };
};

module.exports = Command;
