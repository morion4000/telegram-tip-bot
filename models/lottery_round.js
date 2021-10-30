var Sequelize = require('sequelize'),
  _ = require('underscore');

var LotteryRound = function (sequelize) {
  var fields = [
    'id',
    'name',
    'winner_1_id',
    'prize',
    'tickets',
    'ended',
    'fee',
    'started_at',
    'ended_at',
    'created_at',
    'updated_at',
  ];

  var lottery_round = sequelize.define(
    'LotteryRound',
    {
      name: Sequelize.STRING,
      winner_1_id: Sequelize.INTEGER,
      prize: Sequelize.INTEGER,
      tickets: Sequelize.INTEGER,
      ended: Sequelize.BOOLEAN,
      fee: Sequelize.INTEGER,
      started_at: Sequelize.DATE,
      ended_at: Sequelize.DATE,
    },
    {
      underscored: true,
      tableName: 'lottery_rounds',
    }
  );

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
