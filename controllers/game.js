const config = require('./../config');
const log_model = require('./../models').log.model;
const Telegram = require('./../services/telegram');
const Redis = require('./../services/redis');
const { transfer_reward, decrypt } = require('./../utils');

class Game {
  constructor() {
    this.telegram = new Telegram();
    this.redis = new Redis();

    this.redis.connect();
  }

  compute_score(
    remainingBalance,
    wave,
    durationMinutes,
    towersSoldCount,
    repairsCount
  ) {
    let score = 0;

    score =
      wave * 50 +
      remainingBalance * 0.1 -
      durationMinutes * 40 -
      towersSoldCount * 10 -
      repairsCount * 30;

    score /= 10;

    return Math.max(Math.ceil(score), 1);
  }

  async set_data_game(sessionId, data) {
    const timestamp = new Date().getTime();
    const key = `game_${sessionId}_${timestamp}`;

    await this.redis.set(key, JSON.stringify({ ...data, timestamp }));
    await this.redis.expire(key, 60 * 60 * 24); // 1 day
  }

  async get_game_data(sessionId) {
    const activities = [];

    for await (const key of this.redis.scanIterator(`game_${sessionId}_*`)) {
      try {
        const activityRaw = await this.redis.get(key);

        if (!activityRaw) {
          throw new Error('Activity is empty');
        }

        const activity = JSON.parse(activityRaw);

        activities.push(activity);
      } catch (err) {
        console.log(`[ACTIVITY] Error parsing activity: ${err}`);
      }
    }

    return activities;
  }

  async verify_game_data(sessionId, data) {
    const activities = await this.get_game_data(sessionId);

    if (!activities.length) {
      throw new Error('No activities found');
    }

    // TODO: Check if the activities are in order
    // TODO: Check for the score to be incremental
    // TODO: Check for the activities to be in a reasonable timeframe
    // TODO: Check for the activities no to match the wave no (+- a few waves)
  }

  async end_game(sessionId, query, data) {
    let score = 0;
    const { from, message, inline_message_id } = query;
    const {
      remainingBalance,
      wave,
      durationMinutes,
      towersSoldCount,
      repairsCount,
    } = data;

    await this.verify_game_data(sessionId, data);

    score = this.compute_score(
      remainingBalance,
      wave,
      durationMinutes,
      towersSoldCount,
      repairsCount
    );

    await this.set_telegram_score(message, inline_message_id, from, score);

    const { user, balance, new_balance } = await transfer_reward(
      from.username,
      score
    );

    await this.create_log(user, balance, new_balance, score, data);
  }

  set_telegram_score(message, inline_message_id, from, score) {
    if (message) {
      options.chat_id = message.chat.id;
      options.message_id = message.message_id;
    } else {
      options.inline_message_id = inline_message_id;
    }

    return this.telegram.setGameScore(from.id, score, options);
  }

  create_log(user, balance, new_balance, score, options) {
    return log_model.create(
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
  }

  async scores(req, res, next) {
    console.log(`POST /game/scores`);

    const queryId = req.headers ? req.headers.telegramQuery : null;
    const sessionId = req.headers ? req.headers.sessionId : null;
    const data = req.body?.data || '';

    try {
      const key = await this.redis.get(`query_${queryId}`);
      const query = JSON.parse(key);

      if (!queryId || !key) {
        throw new Error('Invalid query');
      }

      const decrypted_data = decrypt(config.game.scores_key, data);
      const decoded_data = JSON.parse(decrypted_data);

      if (!decoded_data) {
        throw new Error('Invalid data');
      }

      if (decoded_data.gameOver) {
        await this.end_game(sessionId, query, decoded_data);
      } else {
        await this.set_data_game(sessionId, decoded_data);
      }
    } catch (err) {
      console.log(err);

      return res.status(400).send('Cannot receive data');
    }

    return res.json({ received: true });
  }
}

module.exports = new Game();
