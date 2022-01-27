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
    yearly_percentage: 5,
    yearly_percentage_tier1: 15,
    yearly_percentage_tier2: 20,
    yearly_percentage_tier3: 25,
    threshold: 1,
    tier1_threshold: 10000,
    tier2_threshold: 1000000,
    tier3_threshold: 10000000,
  },
  public_channels: [-1001310583642, -1001329381051, -1001510982248],
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
      usd: 8,
      bonus_lottery: 500,
      locked_period_days: 1,
    },
    package2: {
      webd: 50000,
      usd: 40,
      bonus_lottery: 2500,
      locked_period_days: 2,
    },
    package3: {
      webd: 100000,
      usd: 70,
      bonus_lottery: 5000,
      locked_period_days: 5,
    },
  },
  blockchain: {
    block_time_seconds: 40,
  },
  lottery: {
    staking_yearly_percentage: 3,
    last_n_digits_of_block_hash: 10, // this allows for up to 10 billion lottery tickets
    upper_bound_of_block_hash: 9999999999,
    duration_blocks: 15120, // ~7 days (1 block = ~40 seconds)
    duration_days: 7,
  },
  withdraws: {
    wait_time_hours: 24,
    max_amount: 10000000,
  },
};
