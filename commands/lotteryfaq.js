const Telegram = require('./../services/telegram');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    let message = '';

    // https://en.wikipedia.org/wiki/Premium_Bond
    // https://webdchain.io/block/0000000000000419f11950bab07f1ea973eecf0bf40b8fae4975cad412f7143b
    // https://www.rapidtables.com/convert/number/hex-to-decimal.html

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

    // How many numbers are in the lottery?
    // How is the winner number calculated?
    // FORMULA: FLOOR(TICKETS_NUMBER * LAST_TEN_DIGITS_OF_BLOCK_HASH_DECIMAL / 9999999999)

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
