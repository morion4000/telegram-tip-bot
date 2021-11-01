/*
  Worker will only run every 5 minutes.
*/

const user_model = require('./../models').user.model;
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const Telegram = require('./../services/telegram');
const config = require('./../config');
const numeral = require('numeral');

exports.handler = async function (event) {
  const telegram = new Telegram();
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

  const participants = await lottery.get_participants();

  for (const participant of participants) {
    telegram
      .send_message(
        participant.telegram_id,
        `🎲 Weekly round finished. Winning ticket number is *${winner_ticket_number}* ([winning block](${webdchain.get_block_url_by_hash(
          hash
        )})).\n` +
          `💵 Prize of ${round.prize} WEBD was won by @${winner_user.telegram_username}.`,
        Telegram.PARSE_MODE.MARKDOWN
      )
      .catch(console.error);
  }

  await lottery.distribute_prize(round, winner_user);

  telegram
    .send_message(
      winner_user.telegram_id,
      `🎉 Congratulations! You have won ${round.prize} WEBD. Funds have been added to your /tipbalance.`
    )
    .catch(console.error);

  await lottery.close_round(round, winner_user, winner_ticket_number, hash);

  const new_round = await lottery.start_round();

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

    telegram
      .send_message(
        user.telegram_id,
        `💰 You have withdrawn ${user.balance_lottery_withdraw} WEBD from lottery. The funds are in your /tipbalance.`
      )
      .catch(console.error);
  }

  // Create new tickets automatically
  const users_with_balance_lottery =
    await lottery.get_random_users_with_balance_lottery();

  for (const user of users_with_balance_lottery) {
    const { tickets, price, range_min, range_max } = await lottery.buy_tickets(
      user,
      user.balance_lottery
    );

    telegram
      .send_message(
        user.telegram_id,
        `🎟 You have bought ${tickets} /lottery_tickets for the new round (${price} WEBD / ticket).`
      )
      .catch(console.error);
  }

  return {
    message: ``,
    event,
  };
};
