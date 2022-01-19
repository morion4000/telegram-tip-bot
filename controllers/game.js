const { transfer_reward } = require('./../utils');

class Game {
  constructor() {
    this.queries = {};
    this.bot = null;
  }

  async scores(req, res, next) {
    console.log(`POST /game/scores`);

    const query = req.headers ? req.headers.query : null;
    const score = req.body ? req.body.score : null;

    if (query && score && this.queries.hasOwnProperty(query)) {
      try {
        const { from, message, inline_message_id } = this.queries[query];
        const options = {};

        if (score > 1000) {
          throw new Error('Score too high');
        }

        if (message) {
          options.chat_id = message.chat.id;
          options.message_id = message.message_id;
        } else {
          options.inline_message_id = inline_message_id;
        }

        await this.bot.setGameScore(from.id, parseInt(score), options);

        await transfer_reward(from.username, score);
      } catch (err) {
        console.error(err.message);

        return res.status(400).send(`Game Error: ${err.message}`);
      }
    }

    return res.json({ received: true });
  }
}

module.exports = new Game();
