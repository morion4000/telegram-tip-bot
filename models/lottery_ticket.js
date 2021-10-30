var Sequelize = require('sequelize'),
  _ = require('underscore');

var LotteryTicket = function (sequelize) {
  var fields = [
    'id',
    'round_id',
    'user_id',
    'range_min',
    'range_max',
    'price',
    'staking_rewards',
    'created_at',
    'updated_at',
  ];

  var lottery_ticket = sequelize.define(
    'LotteryTicket',
    {
      round_id: Sequelize.INTEGER,
      user_id: Sequelize.INTEGER,
      range_min: Sequelize.INTEGER,
      range_max: Sequelize.INTEGER,
      price: Sequelize.INTEGER,
      staking_rewards: Sequelize.FLOAT,
    },
    {
      underscored: true,
      tableName: 'lottery_tickets',
    }
  );

  var create = function (params, callback) {
    lottery_ticket
      .create(params)
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var update = function (fields, condition, callback) {
    lottery_ticket
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
    lottery_ticket
      .findOne({
        attributes: fields,
        where: {
          id: params.params.lottery_ticket_id,
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
    lottery_ticket
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
    lottery_ticket
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
    model: lottery_ticket,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy,
  };
};

module.exports = LotteryTicket;
