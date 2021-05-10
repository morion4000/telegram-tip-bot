require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const webhooks = require('./controllers/webhooks');
const config = require('./config');

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*',
  })
);

/*
app.post(
  '/webhooks/stripe',
  bodyParser.raw({ type: 'application/json' }),
  webhooks.stripe.bind(webhooks)
);
*/

app.post('/webhooks/paypal', bodyParser.json(), webhooks.paypal.bind(webhooks));

app.get('/v1/prices', (req, res, next) => res.send(config.topup));

app.listen(port, () => {
  console.log(`App listening on ${port}`);

  require('./bot');
});
