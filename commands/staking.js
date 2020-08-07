var user = require('./../models').user,
  log = require('./../models').log,
  config = require('./../config'),
  numeral = require('numeral'),
  _ = require('underscore');

var Command = function(bot) {
  return function(msg, match) {
    try {
      var resp = '';

      console.log(msg.text);

      if (msg.chat.type !== 'private') {
        resp = 'Private command. Please DM the bot: @webdollar_tip_bot to use the command.';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      if (!msg.from.username) {
        resp = 'Please set an username for your telegram account to use the bot.';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      user.model.findOne({
        where: {
          telegram_username: msg.from.username
        }
      })
          .then(function (found_user) {
            if (found_user) {
              var minimum_balance = parseInt(1 / (config.staking.monthly_percentage / 3000));

              resp += 'The staking reward is ' + (config.staking.monthly_percentage * 12) + '% per year, compounded daily.\n\n';
              resp += 'Your /tipbalance must be at least ' + numeral(minimum_balance).format('0,0') + ' WEBD to get staking rewards.\n\n';
              resp += 'Latest rewards for @' + found_user.telegram_username + '\n\n';

              log.model.findAll({
                where: {
                  user_id: found_user.id,
                  event: 'staking'
                }
              }).then(function (logs) {
                if (logs.length === 0) {
                  resp += 'No rewards yet, /deposit funds to start staking.';
                }

                var reversed = logs.reverse();

                for (var i = 0; i < reversed.length; i++) {
                  var l = reversed[i];
                  var extra = JSON.parse(l.extra_message);

                  if (i >= 20) {
                    resp += '\t ...\n';
                    break;
                  }

                  resp += '\t ✅ ' + l.message + ': *' + numeral(extra.reward).format('0,0') + '* WEBD (' + l.createdAt.toDateString() + ')\n';
                }

                //resp += '\nFor bigger staking rewards we recommend: https://www.hostero.eu/docs/webdollar-pos-mining';

                bot.sendMessage(msg.chat.id, resp, {
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true,
                  disable_notification: true,
                });
              });
            } else {
              resp = 'Your user can not be found. Create a new acount /start';

              bot.sendMessage(msg.chat.id, resp, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                disable_notification: true,
              });
            }
          })
          .catch(console.error);
    } catch(e) {
      console.error('/staking', e);

      bot.sendMessage(msg.chat.id, config.messages.internal_error, {
        //parse_mode: 'Markdown',
        disable_web_page_preview: true,
        disable_notification: true,
      });
    }
  };
};

module.exports = Command;
