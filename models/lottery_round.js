const Sequelize = require('sequelize');
const _ = require('underscore');

const lottery_ticket = require('./index').lottery_ticket.model;

var LotteryRound = function (sequelize) {
  var fields = [
    'id',
    'name',
    'winner_1_user_id',
    'winner_1_ticket_number',
    'prize',
    'tickets',
    'ended',
    'fee',
    'started_at',
    'ended_at',
    'start_block_height',
    'end_block_height',
    'created_at',
    'updated_at',
  ];

  var lottery_round = sequelize.define(
    'LotteryRound',
    {
      name: Sequelize.STRING,
      winner_1_user_id: Sequelize.INTEGER,
      winner_1_ticket_number: Sequelize.INTEGER,
      prize: Sequelize.INTEGER,
      tickets: Sequelize.INTEGER,
      ended: Sequelize.BOOLEAN,
      fee: Sequelize.INTEGER,
      start_block_height: Sequelize.INTEGER,
      end_block_height: Sequelize.INTEGER,
      started_at: Sequelize.DATE,
      ended_at: Sequelize.DATE,
    },
    {
      underscored: true,
      tableName: 'lottery_rounds',
    }
  );

  lottery_round.hasOne(lottery_ticket, {
    foreignKey: 'round_id',
  });

  var create = function (params, callback) {
    lottery_round
      .create(params)
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var update = function (fields, condition, callback) {
    lottery_round
      .update(fields, {
        where: condition,
      })
      .then(function (result) {
        callback();
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var find = function (params, callback) {
    lottery_round
      .findOne({
        attributes: fields,
        where: {
          id: params.params.lottery_round_id,
        },
      })
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var findAll = function (params, callback) {
    lottery_round
      .findAll({
        attributes: fields,
        where: params.filters,
      })
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var destroy = function (condition, callback) {
    lottery_round
      .destroy({
        where: condition,
      })
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  return {
    model: lottery_round,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy,
  };
};

module.exports = LotteryRound;
