var Sequelize = require('sequelize'),
  _ = require('underscore');

var Transaction = function(sequelize) {

  var fields = [
    'id',
    'user_id',
    'type',
    'amount',
    'tries',
    'processed',
    'deleted',
    'transaction_from',
    'transaction_to',
    'transaction_hash',
    'extra_data',
    'created_at',
    'updated_at'
  ];

  var transaction = sequelize.define('Transaction', {
    type: Sequelize.STRING,
    amount: Sequelize.INTEGER,
    tries: Sequelize.INTEGER,
    processed: Sequelize.BOOLEAN,
    deleted: Sequelize.BOOLEAN,
    transaction_from: Sequelize.STRING,
    transaction_to: Sequelize.STRING,
    transaction_hash: Sequelize.STRING,
    extra_data: Sequelize.TEXT
  }, {
    underscored: true,
    tableName: 'transactions'
  });

  var create = function(params, callback) {
    transaction.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    transaction.update(fields, {
        where: condition
      })
      .then(function(result) {
        callback();
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var find = function(params, callback) {
    transaction.findOne({
        attributes: fields,
        where: {
          id: params.params.transaction_id
        }
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var findAll = function(params, callback) {
    transaction.findAll({
        attributes: fields,
        where: params.filters
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var destroy = function(condition, callback) {
    transaction.destroy({
        where: condition
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  return {
    model: transaction,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Transaction;
