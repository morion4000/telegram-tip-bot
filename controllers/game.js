const util = require('util');

const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const config = require('./../config');
const { get_amount_for_price } = require('./../utils');

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

        if (message) {
          options.chat_id = message.chat.id;
          options.message_id = message.message_id;
        } else {
          options.inline_message_id = inline_message_id;
        }

        await this.bot.setGameScore(from.id, parseInt(score), options);

        // TODO: Tip user
        //delete this.queries[query];
      } catch (err) {
        console.error(err);

        return res.status(400).send(`Game Error: ${err.message}`);
      }
    }

    return res.json({ received: true });
  }
}

module.exports = new Game();
