var Sequelize = require('sequelize'),
  _ = require('underscore');

var Coin = function (sequelize) {
  var fields = [
    'id',
    'name',
    'ticker',
    'price_usd',
    'price_eur',
    'price_btc',
    'price_eth',
    'volume_daily_high_usd',
    'volume_daily_low_usd',
    'volume_daily_total_usd',
    'market_cap_usd',
    'created_at',
    'updated_at',
  ];

  var coin = sequelize.define(
    'Coin',
    {
      name: Sequelize.STRING,
      ticker: Sequelize.STRING,
      price_usd: Sequelize.FLOAT,
      price_eur: Sequelize.FLOAT,
      price_btc: Sequelize.FLOAT,
      price_eth: Sequelize.FLOAT,
      volume_daily_high_usd: Sequelize.FLOAT,
      volume_daily_low_usd: Sequelize.FLOAT,
      volume_daily_total_usd: Sequelize.FLOAT,
      market_cap_usd: Sequelize.FLOAT,
    },
    {
      underscored: true,
      tableName: 'coins',
    }
  );

  var create = function (params, callback) {
    coin
      .create(params)
      .then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err, null);
      });
  };

  var update = function (fields, condition, callback) {
    coin
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
    coin
      .findOne({
        attributes: fields,
        where: {
          id: params.params.coin_id,
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
    coin
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
    coin
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
    model: coin,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy,
  };
};

module.exports = Coin;
