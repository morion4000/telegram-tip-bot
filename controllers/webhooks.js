const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class Webhooks {
  stripe(req, res, next) {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_SIGNING_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log(session);
    }

    res.json({ received: true });
  }
}

module.exports = new Webhooks();
