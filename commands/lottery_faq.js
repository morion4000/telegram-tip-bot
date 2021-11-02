const Telegram = require('./../services/telegram');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    let message = 'Not implemented';

    // https://en.wikipedia.org/wiki/Premium_Bond
    // https://webdchain.io/block/0000000000000419f11950bab07f1ea973eecf0bf40b8fae4975cad412f7143b
    // https://www.rapidtables.com/convert/number/hex-to-decimal.html

    // FORMULA: FLOOR(TICKETS_NUMBER * LAST_TEN_DIGITS_OF_BLOCK_HASH_DECIMAL / 9999999999)

    // TODO: Q & A

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
