
module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  var resp = 'Not implemented';

  // https://en.wikipedia.org/wiki/Premium_Bond
  // https://webdchain.io/block/0000000000000419f11950bab07f1ea973eecf0bf40b8fae4975cad412f7143b
  // https://www.rapidtables.com/convert/number/hex-to-decimal.html

  // FORMULA: FLOOR(TICKETS_NUMBER * LAST_TEN_DIGITS_OF_BLOCK_HASH_DECIMAL / 9999999999)

  bot.sendMessage(msg.chat.id, resp, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    disable_notification: true,
  });
};
