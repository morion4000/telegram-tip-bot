const Telegram = require('./../services/telegram');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    let message = '';

    // https://en.wikipedia.org/wiki/Premium_Bond
    // https://webdchain.io/block/0000000000000419f11950bab07f1ea973eecf0bf40b8fae4975cad412f7143b
    // https://www.rapidtables.com/convert/number/hex-to-decimal.html

    // FORMULA: FLOOR(TICKETS_NUMBER * LAST_TEN_DIGITS_OF_BLOCK_HASH_DECIMAL / 9999999999)

    message += `*How much does a ticket cost?* \n`;
    message += `📖 The price of a ticket increases 30% per day. It starts at 1 WEBD / ticket.\n\n`;

    // How is the prize pool calculated? (tickets * config.lottery.staking_yearly_percentage) / 100 / 365
    // How long does the lottery last? 7 days (or blocks)
    // How are numbers assigned?
    // How many numbers does a ticket have?
    // How many numbers are in the lottery?
    // How is the winner number calculated?
    // How do I know if I have a winning ticket number?
    // How do I get tickets?

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
