require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const game = require('./controllers/game');
const config = require('./config');

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.post(
  '/game/scores',
  cors({
    origin: config.game.telegram_origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
  bodyParser.json(),
  game.scores.bind(game)
);

app.listen(port, () => {
  console.log(`App listening on ${port}`);

  const { bot } = require('./bot');
});
