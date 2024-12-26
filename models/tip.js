var Sequelize = require('sequelize'),
  _ = require('underscore');

var Tip = function (sequelize) {
  var fields = [
    'id',
    'amount',
    'private',
    'rain',
    'from_user',
    'to_user',
    'telegram_message_id',
    'telegram_chat_id',
    'telegram_text',
    'created_at',
    'updated_at',
  ];

  var tip = sequelize.define(
    'Tip',
    {
      amount: Sequelize.INTEGER,
      private: Sequelize.BOOLEAN,
      rain: Sequelize.BOOLEAN,
      telegram_message_id: Sequelize.STRING,
      telegram_chat_id: Sequelize.STRING,
      telegram_text: Sequelize.STRING,
    },
    {
      underscored: true,
      tableName: 'tips',
    }
  );

  var create = function (params, callback) {
    tip
      .create(params)
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var update = function (fields, condition, callback) {
    tip
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
    tip
      .findOne({
        attributes: fields,
        where: {
          id: params.params.tip_id,
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
    tip
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
    tip
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
    model: tip,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy,
  };
};

module.exports = Tip;
