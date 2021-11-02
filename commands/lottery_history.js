const Telegram = require('./../services/telegram');


module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  const telegram = new Telegram();
  let message = 'Not implemented';

  await telegram.send_message(
    msg.chat.id,
    message,
    Telegram.PARSE_MODE.MARKDOWN,
    false
  );
};
