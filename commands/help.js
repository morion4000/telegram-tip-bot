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
    resp += '\t /withdraw - Withdraw funds from your account to the wallet you set or a WEBD adress \n';
    resp += '\t /transactions - Shows the transactions for your account \n';
    resp += '\t /fees - Shows the fees \n';
    resp += '\t /price - Shows the price and volume for WEBD \n';
    resp += '\t /staking - Shows the staking rewards received \n';
    resp += '\t /stats - Bot statistics \n';
    resp += '\t /scoreboard - Top 10 tippers (only public tips are counted) \n';
    resp += '\t /topup - Buy WEBD with your card or Apple/Google Pay \n';
    
    resp += '\n🆘 You can contact @morion4000 for any issues you encounter with the bot.';

    bot.sendMessage(msg.chat.id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  };
};

module.exports = Command;
