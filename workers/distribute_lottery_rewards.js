/*
  Worker will only run every 5 minutes.
*/

const user_model = require('./../models').user.model;
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const config = require('./../config');
const numeral = require('numeral');

exports.handler = async function (event) {
  const webdchain = new Webdchain();
  const current_height = await webdchain.get_height();
  const lottery = new Lottery(current_height);
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
  const { hash } = await webdchain.get_block_by_height(height);
  const winner_ticket_number = await lottery.calculate_winner_ticket_number(
    hash
  );

  const winner_user = await lottery.get_winner_user(winner_ticket_number);

  console.log(`Winner ticket number: ${winner_ticket_number}`);
  console.log(`Winner user id: ${winner_user.id}`);

  await lottery.distribute_prize(round, winner_user);
  // TODO: Notify the winner

  await lottery.close_round(round, winner_user, winner_ticket_number);

  const new_round = await lottery.start_round();
  // TODO: Notify the participants

  // Withdraw pending lottery balances
  const users_with_balance_lottery_withdraw =
    await lottery.get_users_with_balance_lottery_withdraw();

  for (const user of users_with_balance_lottery_withdraw) {
    await user_model.update(
      {
        balance: user.balance + user.balance_lottery_withdraw,
        balance_lottery_withdraw: 0,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    // TODO: Notify the user that withdraw was successful
  }

  // Create new tickets automatically
  const users_with_balance_lottery =
    await lottery.get_random_users_with_balance_lottery();

  for (const user of users_with_balance_lottery) {
    await lottery.buy_tickets(user, user.balance_lottery);

    // TODO: Notify the user that they bought tickets
  }

  return {
    message: ``,
    event,
  };
};
