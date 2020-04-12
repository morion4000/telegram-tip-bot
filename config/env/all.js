module.exports = {
  mysql: {
    connection_string: process.env.MYSQL_CONNECTION_STRING,
    logging: console.log,
    max_concurent_queries: 200,
    pool: {
      maxConnections: 20,
      maxIdleTime: 30
    }
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
  },
  webdscan: {
    token: process.env.WEBDSCAN_TOKEN,
  },
  webdollar: {
    node: {
      url: process.env.WEBDOLLAR_NODE_URL,
      key: process.env.WEBDOLLAR_NODE_KEY
    }
  },
  vault: 'WEBD$gDnTKoDgfy4k8f3ahDfCGG7yKQMxgdrDBr$',
  initial_balance: 0,
  webd_price_usd: 0.00020,
  fees: {
    tip: 0, // fixed
    withdraw: 10, // fixed
    deposit: 0, // fixed
  },
  staking: {
    monthly_percentage: 0.5,
  },
  mailgun: {
    key: process.env.MAILGUN_KEY,
    domain: 'mg.hostero.eu'
  },
  admin: {
    email: 'hosteroeu@gmail.com',
    telegram_username: 'morion4000',
    telegram_chat_id: 528354447
  },
  messages: {
    internal_error: 'Internal error. Please contact @morion4000 for support.'
  }
};
