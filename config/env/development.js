module.exports = {
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
  game: {
    id: 'hauntedtower',
    url: 'https://a0e3-79-119-254-64.ngrok.io',
    max_score: 1000,
    max_user_rewards: 10000,
  },
};
