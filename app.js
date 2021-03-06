const express = require('express');
const bodyParser = require('body-parser');

const webhooks = require('./controllers/webhooks');

const app = express();
const port = process.env.PORT || 4000;

app.post(
  '/webhooks/stripe',
  bodyParser.raw({ type: 'application/json' }),
  webhooks.stripe
);

app.post(
  '/webhooks/paypal',
  bodyParser.json(),
  webhooks.paypal
);

app.listen(port, () => {
  console.log(`App listening on ${port}`);

  require('./bot');
});
