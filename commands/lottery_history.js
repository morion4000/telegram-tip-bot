
module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  var resp = 'Not implemented';

  console.log(msg.text, msg.chat.id);

  bot.sendMessage(msg.chat.id, resp, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    disable_notification: true,
  });
};
