const config = require('./../config');
const log_model = require('./../models').log.model;
const Telegram = require('./../services/telegram');
const Redis = require('./../services/redis');
const { transfer_reward, format_number, decrypt } = require('./../utils');

class Game {
  constructor() {
    this.telegram = new Telegram();
    this.redis = new Redis();

    this.redis.connect();
  }

  async scores(req, res, next) {
    console.log(`POST /game/scores`);

    const queryId = req.headers ? req.headers.query : null;
    const encrypted_message = req.headers ? req.headers.message : null;
    const score = req.body ? parseInt(req.body.score) : null;
    const key = await this.redis.get(`query_${queryId}`);
    const scores_key = config.game.scores_key;

    const decrypted_message = decrypt(scores_key, encrypted_message);

    if (decrypted_message !== `${queryId}:${score}:${scores_key}`) {
      console.log('Game Error: Invalid secret');

      return res.status(400).send('Game Error: Invalid secret');
    }

    if (queryId && score && key) {
      try {
        const query = JSON.parse(key);
        const { from, message, inline_message_id } = query;
        const options = {};

        if (req.get('origin') !== config.game.telegram_origin) {
          throw new Error('Invalid origin');
        }

        if (score > config.game.max_score) {
          throw new Error('Score too high');
        }

        if (message) {
          options.chat_id = message.chat.id;
          options.message_id = message.message_id;
        } else {
          options.inline_message_id = inline_message_id;
        }

        await this.telegram.setGameScore(from.id, score, options);

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
              options,
            }),
            source: 'controllers.game',
          },
          {
            logging: false,
          }
        );
      } catch (err) {
        console.error(err.message);

        return res.status(400).send(`Game Error: ${err.message}`);
      }
    } else {
      console.log('Game Error: Invalid query or score');

      return res.status(400).send('Game Error: Invalid query or score');
    }

    return res.json({ received: true });
  }
}

module.exports = new Game();
