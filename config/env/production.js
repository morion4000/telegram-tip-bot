module.exports = {
  mysql: {
    connection_string: process.env.MYSQL_CONNECTION_STRING,
    logging: console.log,
    max_concurent_queries: 200,
    pool: {
      maxConnections: 20,
      maxIdleTime: 30,
    },
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
  },
  redis: {
    socket: {
      host: process.env.REDIS_HOSTNAME,
      port: process.env.REDIS_PORT,
    },
    password: process.env.REDIS_PASSWORD,
  },
  game: {
    id: 'hauntedtower',
    url: 'https://telegram.hauntedtower.com',
    max_score: 5000,
    max_user_rewards: 10000,
    telegram_channel: -1001510982248,
    telegram_origin: 'https://telegram.hauntedtower.com',
    scores_key: process.env.SCORES_KEY,
  },
};
