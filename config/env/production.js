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
  paypal: {
    mode: 'live',
    client_id:
      'AUpQPlinLaeSrp3piLstduLFHcjMfWIkn92jbaD_1hpDPk4LTvt8zmNFTnhYkYhqlV7EzJxYHVSW8K2k',
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    webhook_id: '47S86863536581454',
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
  },
  redis: {
    socket: {
      host: process.env.REDIS_HOSTNAME,
    },
    password: process.env.REDIS_PASSWORD,
  },
  game: {
    id: 'hauntedtower',
    url: 'https://telegram.hauntedtower.com',
    max_score: 500,
    max_user_rewards: 10000,
    telegram_channel: -1001510982248,
    telegram_origin: 'https://telegram.hauntedtower.com',
    scores_key: process.env.SCORES_KEY,
  },
};
