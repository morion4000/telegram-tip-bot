var Sequelize = require('sequelize'),
  _ = require('underscore'),
  tip = require('./index').tip.model,
  log = require('./index').log.model,
  transaction = require('./index').transaction.model,
  lottery_round = require('./index').lottery_round.model,
  lottery_ticket = require('./index').lottery_ticket.model;

var User = function (sequelize) {
  var fields = [
    'id',
    'wallet',
    'balance',
    'balance_locked',
    'balance_lottery',
    'balance_lottery_withdraw',
    'telegram_id',
    'telegram_username',
    'telegram_firstname',
    'telegram_lastname',
    'created_at',
    'updated_at',
  ];

  var user = sequelize.define(
    'User',
    {
      wallet: Sequelize.STRING,
      balance: Sequelize.INTEGER,
      balance_locked: Sequelize.INTEGER,
      balance_lottery: Sequelize.INTEGER,
      balance_lottery_withdraw: Sequelize.INTEGER,
      telegram_id: Sequelize.STRING,
      telegram_username: Sequelize.STRING,
      telegram_firstname: Sequelize.STRING,
      telegram_lastname: Sequelize.STRING,
    },
    {
      underscored: true,
      tableName: 'users',
    }
  );

  user.hasOne(tip, {
    foreignKey: 'from_user',
  });

  user.hasOne(tip, {
    foreignKey: 'to_user',
  });

  user.hasOne(transaction, {
    foreignKey: 'user_id',
  });

  user.hasOne(log, {
    foreignKey: 'user_id',
  });

  user.hasOne(lottery_ticket, {
    foreignKey: 'user_id',
  });

  user.hasOne(lottery_round, {
    foreignKey: 'winner_1_user_id',
  });

  var create = function (params, callback) {
    user
      .create(params)
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var update = function (fields, condition, callback) {
    user
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
    user
      .findOne({
        attributes: fields,
        where: {
          id: params.params.user_id,
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
    user
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
    user
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
    model: user,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy,
  };
};

module.exports = User;
