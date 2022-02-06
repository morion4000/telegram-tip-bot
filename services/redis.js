const redis = require('redis');
const config = require('./../config');

module.exports = class Telegram {
  constructor() {
    this.client = redis.createClient(config.redis);

    this.client.on('ready', () => console.log('[REDIS] Connected'));
    this.client.on('error', (err) => console.log('[REDIS] Error', err));
  }

  connect() {
    return this.client.connect();
  }

  set(key, value) {
    return this.client.set(key, value);
  }

  expires(key, seconds) {
    return this.client.expire(key, seconds);
  }

  scanIterator(match) {
    return this.client.scanIterator({
      MATCH: math,
      // COUNT: 1000,
    });
  }
};
