module.exports = {
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
  game: {
    id: 'hauntedtower',
    url: 'https://telegram.hauntedtower.com',
    max_score: 100,
    max_user_rewards: 2500,
    telegram_channel: '-1001510982248',
  },
};
