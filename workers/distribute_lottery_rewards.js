/*
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

  const current_height = await webdchain.get_height();
  const round = await lottery.get_last_round();

  if (current_height < config.lottery.blocks_start) {
    console.log(
      `Lottery not started (${current_height} < ${config.lottery.blocks_start})`
    );

    return;
  }

  if (current_height < round.end_block_height) {
    console.log(
      `Lottery round not ended (${current_height} < ${round.end_block_height})`
    );

    return;
  }

  const height = round.end_block_height;
  const block = await webdchain.get_block_by_height(height);
  const winner_ticket_number = await lottery.calculate_winner_ticket_number(
    block
  );
  const winner = await lottery.get_winner(winner_ticket_number);
  await lottery.distribute_prize(round, winner);

  console.log(`Winner ticket number: ${winner_ticket_number}`);
  console.log(`Winner user id: ${winner.id}`);

  // TODO: Notify the winner

  await lottery.close_round(round, winner, winner_ticket_number);

  const new_round = await lottery.start_round();

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
