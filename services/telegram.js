const TelegramBot = require('node-telegram-bot-api');
const config = require('./../config');

module.exports = class Telegram {
  constructor(polling = false, token = config.telegram.token) {
    this.polling = polling;
    this.token = token;
    this.bot = new TelegramBot(token, {
      polling,
    });
  }

  static get PARSE_MODE() {
    return {
      HTML: 'HTML',
      MARKDOWN: 'Markdown',
      MARKDOWN2: 'MarkdownV2',
    };
  }

  on(event, callback) {
    if (!this.polling) {
      throw new Error('Telegram bot is not in polling mode');
    }

    return this.bot.on(event, callback);
  }

  on_text(text, callback) {
    if (!this.polling) {
      throw new Error('Telegram bot is not in polling mode');
    }

    return this.bot.onText(text, callback);
  }

  send_message(
    chat_id,
    message,
    parse_mode = Telegram.PARSE_MODE.HTML,
    disable_notification = false,
    disable_web_page_preview = true,
    reply_markup = {}
  ) {
    return this.bot.sendMessage(chat_id, message, {
      parse_mode,
      disable_web_page_preview,
      disable_notification,
      reply_markup,
    });
  }

  setGameScore(userId, score, options = {}) {
    return this.bot.setGameScore(userId, score, options);
  }
};
