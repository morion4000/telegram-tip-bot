var _ = require('underscore'),
  env = process.env.NODE_ENV || 'development';

console.log(`[CONFIG] Using environment: ${env}`);

module.exports = _.extend(
  require(__dirname + '/env/all'),
  require(__dirname + '/env/' + env)
);

module.exports.env = env;
