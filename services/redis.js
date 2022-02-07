const redis = require('redis');
const config = require('./../config');

module.exports = class Redis {
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

  get(key) {
    return this.client.get(key);
  }

  expire(key, seconds) {
    return this.client.expire(key, seconds);
  }

  quit() {
    return this.client.quit();
  }

  scanIterator(match) {
    return this.client.scanIterator({
      MATCH: match,
      // COUNT: 1000,
    });
  }
};
