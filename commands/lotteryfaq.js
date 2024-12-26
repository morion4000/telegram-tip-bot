const Telegram = require('./../services/telegram');
const { check_private_message } = require('./../utils');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    await check_private_message(msg);

    const telegram = new Telegram();
    let message = '';

    message += `*What type of lottery is this?* \n`;
    message += `This is a [premium bond](https://en.wikipedia.org/wiki/Premium_Bond) lottery. Users gamble the staking rewards, not the principal itself. \n\n`;

    message += `*How much does a ticket cost?* \n`;
    message += `📖 It starts at 1 WEBD / ticket in the first day. The price of a ticket increases 30% per day. \n\n`;

    message += `*How is the prize calculated?* \n`;
    message +=
      '📖 The prize is calculated using the formula `TICKETS * 3 / 100 / 365 * 7`.\n\n';

    message += `*How long does the lottery last?* \n`;
    message += '📖 The lottery lasts for 15120 blocks or ~7 days.\n\n';

    message += `*How many numbers does a ticket have?* \n`;
    message += '📖 A ticket has 1 number.\n\n';

    message += `*How are ticket numbers assigned?* \n`;
    message +=
      '📖 The lottery numbers are assigned in order, starting with 0.\n\n';

    message += `*Can I pick a ticket number I want?* \n`;
    message += "📖 You can't. Ticket numbers are generated in order.\n\n";

    message += `*How do I get tickets?* \n`;
    message +=
      '📖 To get tickets you have to run `/lotterydeposit 1000`. You can deposit any number.\n\n';

    message += `*How is the winner number calculated?* \n`;
    message +=
      '📖 The winner number is calculated using the formula `TICKETS * LAST_TEN_DIGITS_OF_BLOCK_HASH_IN_DECIMAL / 9999999999` ([convert hash to decimal](https://www.rapidtables.com/convert/number/hex-to-decimal.html)).\n\n';

    await telegram.send_message(
      msg.chat.id,
      message,
      Telegram.PARSE_MODE.MARKDOWN,
      true
    );
  } catch (e) {
    console.log(e);
  }
};
