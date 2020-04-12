var user_model = require('./../models').user.model,
  log_model = require('./../models').log.model,
  config = require('./../config'),
  _ = require('underscore'),
  request = require('request'),
  moment = require('moment'),
  fs = require('fs');

setTimeout(function() {
  process.exit(1);
}, 60 * 1000);

var total_stake = 0;
var hours = new Date().getHours();

// Allow to run only in a certain hour (to be able to do updates)
if (hours !== 10) {
  console.log('closing, not the right hour', hours);
  return;
}

log_model.findAll({
  where: {
    event: 'staking'
  },
  limit: 1,
  order: [
    ['createdAt', 'DESC']
  ],
  logging: false
}).then(function(logs) {
  var last_log = logs[0];

  var now = moment(new Date());
  var end = moment(last_log.createdAt);
  var delta = now.diff(end, 'hours');

  if (delta <= 3) {
    console.log('closing, ran recently', delta);
    return;
  }

  user_model.findAll({
      logging: false
    })
    .then(function(users) {
      console.log('found users', users.length);

      for (var i = 0; i < users.length; i++) {
        var user = users[i];

        if (!user.telegram_id) {
          continue;
        }

        var stake = Math.floor(user.balance * config.staking.monthly_percentage / 100 / 30);

        total_stake += stake;

        if (stake === 0) {
          continue;
        }

        console.log('staking', stake, user.telegram_username);

        log_model.create({
          user_id: user.id,
          event: 'staking',
          message: 'New staking reward',
          extra_message: JSON.stringify({
            old_balance: user.balance,
            new_balance: user.balance + stake,
            reward: stake,
            monthly_percentage: config.staking.monthly_percentage
          }),
          source: 'workers.create_stake'
        });

        user_model.update({
          balance: user.balance + stake
        }, {
          where: {
            id: user.id
          }
        });
      }

      console.log('total stake', total_stake);
    });
});
