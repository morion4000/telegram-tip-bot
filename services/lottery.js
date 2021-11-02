const Sequelize = require('sequelize');

const lottery_ticket = require('./../models').lottery_ticket;
const lottery_round = require('./../models').lottery_round;
const user_model = require('./../models').user;
const config = require('./../config');

module.exports = class Lottery {
  constructor(current_height = 0) {
    this.cached_current_height = current_height;
  }

  // https://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
  scale_number(unscaledNum, minAllowed, maxAllowed, min, max) {
    return (
      ((maxAllowed - minAllowed) * (unscaledNum - min)) / (max - min) +
      minAllowed
    );
  }

  scale_number2(num, in_min, in_max, out_min, out_max) {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  // https://www.rapidtables.com/convert/number/hex-to-decimal.html
  convert_hex_to_decimal(hex) {
    return BigInt(`0x${hex}`, 16);
  }

  get_last_n_digits(number, n) {
    return number.toString().slice(-n);
  }

  get_last_ticket_for_round(round) {
    return lottery_ticket.model.findOne({
      where: {
        round_id: round.id,
      },
      order: [['id', 'DESC']],
    });
  }

  get_users_with_balance_lottery_withdraw() {
    return user_model.model.findAll({
      where: {
        balance_lottery_withdraw: {
          [Sequelize.Op.gt]: 0,
        },
      },
    });
  }

  get_random_users_with_balance_lottery() {
    return user_model.model.findAll({
      where: {
        balance_lottery: {
          [Sequelize.Op.gt]: 0,
        },
      },
      order: [Sequelize.fn('RAND')],
    });
  }

  // TODO: Calculate the SUM via query
  async calculate_tickets_number_for_user_and_round(user, round) {
    const tickets = await this.get_tickets_for_user_and_round(user, round);
    let tickets_number = 0;

    for (const ticket of tickets) {
      tickets_number += ticket.tickets;
    }

    return tickets_number;
  }

  async get_last_ticket_number() {
    const round = await this.get_last_round();
    const ticket = await this.get_last_ticket_for_round(round);

    return ticket ? ticket.range_max : 0;
  }

  get_last_round() {
    return lottery_round.model.findOne({
      order: [['id', 'DESC']],
    });
  }

  calculate_ticket_price(days_until_next_round) {
    let price = 1;
    const days_elapsed = 6 - days_until_next_round;

    // Tickets get more expensive over time (30% per day)
    price = price * Math.pow(1.3, days_elapsed);

    return price;
  }

  calculate_days_for_blocks(blocks) {
    return Math.floor(
      (blocks * config.blockchain.block_time_seconds) / 60 / 60 / 24
    );
  }

  async calculate_days_until_next_round() {
    const round = await this.get_last_round();
    const height = this.cached_current_height;
    const blocks_left = round.end_block_height - height;

    const days_left =
      blocks_left > 0 ? this.calculate_days_for_blocks(blocks_left) : 0;

    return Math.floor(days_left);
  }

  async calculate_winner_ticket_number(block_hash) {
    const decimal = this.convert_hex_to_decimal(block_hash);
    const last_ticket_number = await this.get_last_ticket_number();
    const last_digits = this.get_last_n_digits(
      decimal,
      config.lottery.last_n_digits_of_block_hash
    );
    let winner_ticket_number = this.scale_number(
      last_digits,
      0,
      last_ticket_number,
      0,
      config.lottery.upper_bound_of_block_hash
    );

    winner_ticket_number = Math.floor(winner_ticket_number);

    // console.log(`last_ticket_number ${last_ticket_number}`);
    // console.log(`last_digits ${last_digits}`);
    // console.log(`winner_ticket_number ${winner_ticket_number}`);

    return winner_ticket_number;
  }

  async get_winner_user(ticket_number) {
    const ticket = await lottery_ticket.model.findOne({
      where: {
        range_min: {
          [Sequelize.Op.lte]: ticket_number,
        },
        range_max: {
          [Sequelize.Op.gte]: ticket_number,
        },
      },
    });

    return user_model.model.findOne({
      where: {
        id: ticket.user_id,
      },
    });
  }

  get_tickets_for_user(user) {
    return lottery_ticket.model.findAll({
      where: {
        user_id: user.id,
      },
    });
  }

  get_tickets_for_round(round) {
    return lottery_ticket.model.findAll({
      where: {
        round_id: round.id,
      },
    });
  }

  get_participants() {
    return user_model.model.findAll({
      where: {
        balance_lottery: {
          [Sequelize.Op.gt]: 0,
        },
      },
    });
  }

  get_unique_users_for_round(round) {
    return lottery_ticket.model.findAll({
      where: {
        round_id: round.id,
      },
      attributes: ['user_id'],
      group: ['user_id'],
    });
  }

  get_tickets_for_user_and_round(user, round) {
    return lottery_ticket.model.findAll({
      where: {
        user_id: user.id,
        round_id: round.id,
      },
    });
  }

  add_ticket(
    user,
    round,
    tickets,
    range_min,
    range_max,
    price,
    staking_rewards
  ) {
    return lottery_ticket.model.create({
      user_id: user.id,
      round_id: round.id,
      tickets,
      range_min,
      range_max,
      price,
      staking_rewards,
    });
  }

  add_round(name, start_block_height, end_block_height, fee) {
    return lottery_round.model.create({
      name: name,
      start_block_height,
      end_block_height,
      fee,
      ended: false,
      tickets: 0,
      prize: 0,
      started_at: new Date(),
    });
  }

  update_round(round, updates) {
    return lottery_round.model.update(updates, {
      where: {
        id: round.id,
      },
    });
  }

  close_round(round, user, ticket_number, block_hash, chance) {
    return this.update_round(round, {
      ended: true,
      ended_at: new Date(),
      winner_1_user_id: user.id,
      winner_1_ticket_number: ticket_number,
      winner_1_block_hash: block_hash,
      winner_1_chance: chance,
    });
  }

  async start_round() {
    const round = await this.get_last_round();
    const start_block_height = round.end_block_height;
    const end_block_height =
      start_block_height + config.lottery.duration_blocks;

    return this.add_round(
      'Round',
      start_block_height,
      end_block_height,
      config.staking_yearly_percentage
    );
  }

  distribute_prize(user, round) {
    return user_model.model.update(
      {
        balance_lottery: user.balance_lottery + round.prize,
      },
      {
        where: {
          id: user.id,
        },
      }
    );
  }

  async buy_tickets(user, amount) {
    const round = await this.get_last_round();
    const last_ticket_number = await this.get_last_ticket_number();
    const days_until_next_round = await this.calculate_days_until_next_round();
    const price = await this.calculate_ticket_price(days_until_next_round);
    const tickets = parseInt(amount / price);
    const range_min = last_ticket_number > 0 ? last_ticket_number + 1 : 0;
    const range_max = range_min + tickets - 1;
    const daily_staking_rewards =
      (amount * config.lottery.staking_yearly_percentage) / 100 / 365;
    const staking_rewards = daily_staking_rewards * days_until_next_round;

    await this.add_ticket(
      user,
      round,
      tickets,
      range_min,
      range_max,
      price,
      staking_rewards
    );

    await this.update_round(round, {
      tickets: round.tickets + tickets,
      prize: round.prize + staking_rewards,
    });

    return {
      tickets,
      price,
      range_min,
      range_max,
    };
  }
};
