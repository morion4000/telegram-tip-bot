const lottery_ticket = require('./../models').lottery_ticket;
const lottery_round = require('./../models').lottery_round;

module.exports = class Lottery {
  constructor() {}

  convert_hex_to_decimal(hex) {
    return BigInt(hex, 16);
  }

  get_last_n_digits(number, n) {
    return number.toString().slice(-n);
  }

  get_last_ticket_for_round(round) {
    return lottery_ticket.findOne({
      where: {
        round_id: round.id,
      },
      order: [['id', 'DESC']],
    });
  }

  get_last_ticket_number() {
    const round = this.get_last_round();
    const ticket = this.get_last_ticket_for_round(round);

    return ticket ? ticket.range_max : 0;
  }

  get_last_round() {
    return lottery_round.model.findOne({
      order: [['id', 'DESC']],
    });
  }

  calculate_ticket_price() {
    return 0;
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

  add_ticket(user, round, number) {
    return lottery_ticket.model.create({
      user_id: user.id,
      round_id: round.id,
      number: number,
    });
  }

  add_round(name) {
    return lottery_round.model.create({
      name: name,
    });
  }

  async buy_tickets(user, amount) {
    const tickets = 0;

    // TODO: Get curent found
    // TODO: Calculate price based on the current round and amount
    // TODO: Calculate the amount of tickets
    // TODO: Calculate range of tickets
    // TODO: Add tickets to the user

    return tickets;
  }
};
