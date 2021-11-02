const Telegram = require('./../services/telegram');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    const telegram = new Telegram();
    let message = 'Not implemented';

    // TODO: Last 10 rounds

    await telegram.send_message(
      msg.chat.id,
      message,
      Telegram.PARSE_MODE.MARKDOWN,
      false
    );
  } catch (e) {
    console.log(e);
  }
};
