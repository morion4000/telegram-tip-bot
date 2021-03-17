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
  webdscan: {
    token: process.env.WEBDSCAN_TOKEN,
  },
  webdollar: {
    node: {
      url: process.env.WEBDOLLAR_NODE_URL,
      key: process.env.WEBDOLLAR_NODE_KEY,
    },
  },
  vault: 'WEBD$gDnTKoDgfy4k8f3ahDfCGG7yKQMxgdrDBr$',
  initial_balance: 0,
  webd_price_usd: 0.0002,
  fees: {
    tip: 0, // fixed
    withdraw: 10, // fixed
    deposit: 0, // fixed
  },
  /*
  reward per day: 12,960,000
  reward per year: 4,730,400,000
  total supply: 14,000,000,000
  staking supply: 10,000,000,000
  total APR: 33%
  staking APR: 30% (90% POS)
  */
  staking: {
    yearly_percentage: 25,
    yearly_percentage_tier1: 15,
    yearly_percentage_tier2: 20,
    yearly_percentage_tier3: 25,
    threshold: 1,
    tier1_threshold: 10000,
    tier2_threshold: 1000000,
    tier3_threshold: 10000000,
  },
  mailgun: {
    key: process.env.MAILGUN_KEY,
    domain: 'mg.hostero.eu',
  },
  admin: {
    email: 'hosteroeu@gmail.com',
    telegram_username: 'morion4000',
    telegram_chat_id: 528354447,
  },
  messages: {
    internal_error: 'Internal error. Please contact @morion4000 for support.',
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY,
    signing_secret: process.env.STRIPE_SIGNING_SECRET,
  },
  topup: {
    package1: {
      webd: 10000,
      usd: 3,
    },
    package2: {
      webd: 100000,
      usd: 25,
    },
    package3: {
      webd: 1000000,
      usd: 200,
    },
  },
};
