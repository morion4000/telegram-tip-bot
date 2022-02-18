module.exports = {
  mysql: {
    connection_string: `${process.env.MYSQL_CONNECTION_STRING}_dev`,
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
    token: process.env.TELEGRAM_TOKEN_DEV,
  },
};
