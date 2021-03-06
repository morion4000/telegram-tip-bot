const Stripe = require('stripe');
const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');
const qs = require('qs');
const paypal = require('paypal-rest-sdk');
const util = require('util');

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
  get_amount_for_price(price) {
    let amount = 10000;

    switch (price) {
      case 2:
        amount = 10000;
        break;

      case 15:
        amount = 100000;
        break;

      case 120:
        amount = 1000000;
        break;
    }

    return amount;
  }

  async transfer_funds(username, amount, gateway_id) {
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
        extra_data: gateway_id,
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
    console.log(`POST /webhooks/stripe`);

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
      const amount = this.get_amount_for_price(stripe_amount / 100);

      await this.transfer_funds(username, amount, stripe_id);
    }

    res.json({ received: true });
  }

  async paypal(req, res, next) {
    console.log(`POST /webhooks/paypal`);

    const headers = req.headers;
    const body = req.body;
    const verify = util.promisify(paypal.notification.webhookEvent.verify);

    try {
      await verify(headers, body, config.paypal.webhook_id);

      if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
        const unit =
          body.resource &&
          body.resource.purchase_units &&
          body.resource.purchase_units.length
            ? body.resource.purchase_units[0]
            : null;

        if (unit) {
          const username = unit.custom_id || 'morion4000';
          const price = parseInt(unit.amount.value);
          const paypal_id = unit.reference_id;
          const amount = this.get_amount_for_price(price);

          console.log('New purchase', username, price, amount, paypal_id);

          if (username) {
            await this.transfer_funds(username, amount, paypal_id);
          }
        }
      }

      return res.json({ received: true });
    } catch (err) {
      console.error(err);

      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}

module.exports = new Webhooks();
