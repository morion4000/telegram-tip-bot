var Sequelize = require('sequelize'),
  _ = require('underscore');

var Log = function(sequelize) {

  var fields = [
    'id',
    'user_id',
    'event',
    'message',
    'extra_message',
    'source',
    'created_at',
    'updated_at'
  ];

  var log = sequelize.define('Log', {
    event: Sequelize.STRING,
    message: Sequelize.STRING,
    extra_message: Sequelize.TEXT,
    source: Sequelize.STRING,
  }, {
    underscored: true,
    tableName: 'logs'
  });

  var create = function(params, callback) {
    log.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    log.update(fields, {
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
    log.findOne({
        attributes: fields,
        where: {
          id: params.params.log_id
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
    log.findAll({
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
    log.destroy({
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
    model: log,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Log;
