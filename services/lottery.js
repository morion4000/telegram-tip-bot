const lottery_ticket = require('./../models').lottery_ticket;
const lottery_round = require('./../models').lottery_round;
const user_model = require('./../models').user;
const config = require('./../config');

module.exports = class Lottery {
  constructor() {}

  convert_hex_to_decimal(hex) {
    return BigInt(hex, 16);
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
          [Op.gt]: 0,
        },
      },
    });
  }

  get_random_users_with_balance_lottery() {
    return user_model.model.findAll({
      where: {
        balance_lottery: {
          [Op.gt]: 0,
        },
      },
      order: [['id', 'RANDOM']],
    });
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

  calculate_ticket_price() {
    // TODO: calculate price dynamically based on time left until next round starts
    // price gets more expensive as time goes on

    return 1;
  }

  calculate_days_until_next_round() {
    // TODO: calculate dynamically based on time left until next round starts

    return 7;
  }

  calculate_winner_ticket_number(block) {
    // TODO: Implement
    return 4;
  }

  async get_winner_user(ticket_number) {
    // TODO: Make sure range is correct
    const ticket = await lottery_ticket.model.findOne({
      where: {
        range_min: {
          [Op.gte]: ticket_number,
        },
        range_max: {
          [Op.lte]: ticket_number,
        },
      },
    });

    return user_model.model.findById(ticket.user_id);
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

  add_ticket(user, round, range_min, range_max, price, staking_rewards) {
    return lottery_ticket.model.create({
      user_id: user.id,
      round_id: round.id,
      range_min,
      range_max,
      price,
      staking_rewards,
    });
  }

  add_round(name) {
    return lottery_round.model.create({
      name: name,
    });
  }

  update_round(round, updates) {
    return lottery_round.model.update(updates, {
      where: {
        id: round.id,
      },
    });
  }

  close_round(round, user, ticket_number) {
    return this.update_round(round, {
      ended: true,
      ended_at: new Date(),
      winner_1_user_id: user.id,
      winner_1_ticket_number: ticket_number,
    });
  }

  start_round() {
    // TODO: Add start_block_height, end_block_height, etc
    return this.add_round('Round 1');
  }

  distribute_prize(user, round) {
    return user_model.model.update(user.id, {
      balance_lottery: user.balance_lottery + round.prize,
    });
  }

  async buy_tickets(user, amount) {
    const round = await this.get_last_round();
    const last_ticket_number = await this.get_last_ticket_number();
    const price = await this.calculate_ticket_price();
    const tickets = parseInt(amount / price);
    const range_min = last_ticket_number + 1;
    const range_max = range_min + tickets;
    const daily_staking_rewards =
      (amount * config.staking.yearly_percentage) / 100 / 365;
    const days_until_next_round = await this.calculate_days_until_next_round();
    const staking_rewards = daily_staking_rewards * days_until_next_round; // TODO: Rename to interest?

    await this.add_ticket(
      user,
      round,
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
