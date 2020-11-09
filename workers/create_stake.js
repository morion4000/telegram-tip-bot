var user_model = require('./../models').user.model,
  log_model = require('./../models').log.model,
  config = require('./../config'),
  moment = require('moment');

setTimeout(function() {
  process.exit(1);
}, 60 * 1000);

var total_stake = 0;
var hour = new Date().getUTCHours();
var hour_to_run = process.env.HOUR_TO_RUN ? parseInt(process.env.HOUR_TO_RUN) : 10;

// Allow to run only in a certain hour (to be able to do updates)
if (hour !== hour_to_run) {
  console.log('closing, wrong hour. expected:', hour_to_run, 'current:', hour);
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

  // Avoid running multiple times in the same day
  if (delta <= 3) {
    console.log('closing, ran recently. hours ago: ', delta);
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

        var yearly_percentage = 0;

        if (user.balance >= config.staking.tier3_threshold) {
          yearly_percentage = config.staking.yearly_percentage_tier3;
        } else if (user.balance >= config.staking.tier2_threshold) {
          yearly_percentage = config.staking.yearly_percentage_tier2;
        } else if (user.balance >= config.staking.tier1_threshold) {
          yearly_percentage = config.staking.yearly_percentage_tier1;
        }

        var stake = Math.floor(user.balance * yearly_percentage / 100 / 360);

        total_stake += stake;

        if (stake === 0) {
          continue;
        }

        console.log('staking', stake, user.telegram_username, 'percentage', yearly_percentage, 'balance', user.balance);

        log_model.create({
          user_id: user.id,
          event: 'staking',
          message: 'New staking reward',
          extra_message: JSON.stringify({
            old_balance: user.balance,
            new_balance: user.balance + stake,
            reward: stake,
            monthly_percentage: yearly_percentage / 12, // legacy
            yearly_percentage: yearly_percentage, 
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
