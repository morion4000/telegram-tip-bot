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
    mode: 'sandbox',
    client_id:
      'AUDg114HQ7aYRrFTwP1q2rf8wZxk4qukvupBhQzdgrTKoNfmYGeyMVRZaO0d7uDp20EBM_Bi4auVa0SJ',
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    webhook_id: '8T272472T5937810F',
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
    url: 'https://a0e3-79-119-254-64.ngrok.io',
    max_score: 10000,
    max_user_rewards: 100000,
    telegram_channel: 528354447,
    telegram_origin: 'http://localhost:4200',
    scores_key: process.env.SCORES_KEY,
  },
};
