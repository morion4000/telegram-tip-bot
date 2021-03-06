const Stripe = require('stripe');
const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');
const qs = require('qs');
let paypal = require('paypal-rest-sdk');

const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const config = require('./../config');

const stripe = Stripe(config.stripe.secret_key);

paypal.configure({
  mode: config.paypal.mode,
  client_id: config.paypal.client_id,
  client_secret: config.paypal.client_secret,
});

class Webhooks {
  async transfer_funds(username, amount, stripe_id) {
    const bot = new TelegramBot(config.telegram.token, {
      polling: false,
    });

    try {
      const user = await user_model.findOne({
        where: {
          telegram_username: username,
        },
      });

      if (!user) {
        throw new Error(`username not found: ${username}`);
      }

      const new_balance = user.balance + amount;

      await user_model.update(
        {
          balance: new_balance,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      await transaction_model.create({
        type: 'purchase',
        user_id: user.id,
        amount: amount,
        processed: true,
        extra_data: stripe_id,
      });

      const resp =
        '🆕 *Update*: Your account was credited with ' +
        numeral(amount).format('0,0') +
        ' WEBD. Funds in your /tipbalance are receiving /staking rewards.';

      bot.sendMessage(user.telegram_id, resp, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async stripe(req, res, next) {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.signing_secret
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const stripe_id = session.payment_intent;
      const stripe_amount = session.amount_total;
      const stripe_url = session.success_url;
      const query = qs.parse(stripe_url);
      let username = query.username || config.admin.telegram_username;
      let amount = 10000;

      switch (stripe_amount) {
        case 200:
          amount = 10000;
          break;

        case 1500:
          amount = 100000;
          break;

        case 12000:
          amount = 1000000;
          break;
      }

      await this.transfer_funds(username, amount, stripe_id);
    }

    res.json({ received: true });
  }

  async paypal(req, res, next) {
    const headers = req.headers;
    const body = req.body;

    paypal.notification.webhookEvent.verify(
      headers,
      body,
      config.paypal.webhook_id,
      function (error, response) {
        if (error) {
          console.error(JSON.stringify(error));

          next(error);
        } else {
          console.log(response);

          // Verification status must be SUCCESS
          if (response.verification_status === 'SUCCESS') {
            res.json({ received: true });
          } else {
            next(new Error('It was a failed verification'));
          }
        }
      }
    );
  }
}

module.exports = new Webhooks();
