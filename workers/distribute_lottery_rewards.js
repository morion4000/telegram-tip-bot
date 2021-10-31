/*
Query lottery participants and create array.
Calculate the prize pool based on the number of participants.
Calculate random number for the lottery based on the Nth WEBD block?
Distribute the lottery to the winner.

Worker will only run every 5 minutes.

https://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
0000000000000419f11950bab07f1ea973eecf0bf40b8fae4975cad412f7143b => 6590591447954890045974689391889537768735955443814658257392699
last 6 digits of the block number
scaleBetween(392699, 0, 300, 0, 999999);
*/

// function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
//   return (
//     ((maxAllowed - minAllowed) * (unscaledNum - min)) / (max - min) + minAllowed
//   );
// }

// function scale(num, in_min, in_max, out_min, out_max) {
//   return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
// }

const transaction_model = require('./../models').transaction.model;
const user_model = require('./../models').user.model;
const coin_model = require('./../models').coin.model;
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const config = require('./../config');
const TelegramBot = require('node-telegram-bot-api');
const numeral = require('numeral');

exports.handler = async function (event) {
  const webdchain = new Webdchain();
  const lottery = new Lottery();

  const height = await webdchain.get_height();

  if (height < config.lottery.blocks_start) {
    console.log(
      `Lottery not started (${config.lottery.blocks_start}, ${height})`
    );

    return;
  }

  // TODO: Check if the block was mined
  // TODO: Get the block info
  // TODO: Select the winner number

  const round = await lottery.get_last_round();

  // TODO: Select the winner user
  const winner = 4;

  await lottery.distribute_prize(round, winner);

  // TODO: Notify the winner

  await lottery.close_round(round, winner);

  // Add new round
  const new_round = await lottery.add_round('Round');

  // TODO: Notify the participants

  // Withdraw pending lottery balances
  const users_with_balance_lottery_withdraw =
    await lottery.get_users_with_balance_lottery_withdraw();

  for (const user of users_with_balance_lottery_withdraw) {
    await user_model.update(user.id, {
      balance: user.balance + user.balance_lottery_withdraw,
      balance_lottery_withdraw: 0,
    });

    // TODO: Notify the user that withdraw was successful
  }

  // Create new tickets automatically
  const users_with_balance_lottery =
    await get_random_users_with_balance_lottery();

  for (const user of users_with_balance_lottery) {
    await lottery.buy_tickets(user, user.balance_lottery);

    // TODO: Notify the user that they bought tickets
  }

  return {
    message: ``,
    event,
  };
};
