const config = require('./../config');
const log_model = require('./../models').log.model;
const { transfer_reward, format_number } = require('./../utils');

class Game {
  constructor() {
    this.queries = {};
    this.bot = null;
  }

  async scores(req, res, next) {
    console.log(`POST /game/scores`);

    const query = req.headers ? req.headers.query : null;
    const score = req.body ? parseInt(req.body.score) : null;

    if (query && score && this.queries.hasOwnProperty(query)) {
      try {
        const { from, message, inline_message_id } = this.queries[query];
        const options = {};

        if (score > config.game.max_score) {
          throw new Error('Score too high');
        }

        if (message) {
          options.chat_id = message.chat.id;
          options.message_id = message.message_id;
        } else {
          options.inline_message_id = inline_message_id;
        }

        await this.bot.setGameScore(from.id, score, options);

        const { user, balance, new_balance } = await transfer_reward(
          from.username,
          score
        );

        await log_model.create(
          {
            user_id: user.id,
            event: 'reward',
            message: 'New game reward',
            extra_message: JSON.stringify({
              game: 'hauntedtower',
              balance,
              new_balance,
              score,
              options: options,
            }),
            source: 'controllers.game',
          },
          {
            logging: false,
          }
        );

        this.bot
          .sendMessage(
            config.admin.telegram_chat_id,
            `🎮 New reward: @${from.username} received ${format_number(
              score
            )} WEBD`,
            {
              // parse_mode: 'Markdown',
              disable_web_page_preview: true,
              disable_notification: true,
            }
          )
          .catch(console.error);
      } catch (err) {
        console.error(err.message);

        return res.status(400).send(`Game Error: ${err.message}`);
      }
    }

    return res.json({ received: true });
  }
}

module.exports = new Game();
