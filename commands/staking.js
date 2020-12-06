var user = require('./../models').user,
  log = require('./../models').log,
  config = require('./../config'),
  numeral = require('numeral'),
  _ = require('underscore'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text);

      if (msg.chat.type !== 'private') {
        resp =
          'Private command. Please DM the bot: @webdollar_tip_bot to use the command.';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      if (!msg.from.username) {
        resp =
          'Please set an username for your telegram account to use the bot.';

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        return;
      }

      user.model
        .findOne({
          where: {
            [Sequelize.Op.or]: [
              {
                telegram_id: msg.from.id,
              },
              {
                telegram_username: msg.from.username,
              },
            ],
          },
        })
        .then(function (found_user) {
          if (found_user) {
            resp +=
              '📈 The staking reward is compounded daily, based on the WEBD amount in your /tipbalance:\n\n';
            resp +=
              '\t 💰 More than ' +
              numeral(config.staking.tier1_threshold).format('0,0') +
              ' WEBD \t\t\t\t\t\t\t\t ➡️ *' +
              config.staking.yearly_percentage_tier1 +
              '%* per year\n';
            resp +=
              '\t 💰 More than ' +
              numeral(config.staking.tier2_threshold).format('0,0') +
              ' WEBD \t\t\t ➡️ *' +
              config.staking.yearly_percentage_tier2 +
              '%* per year\n';
            resp +=
              '\t 💰 More than ' +
              numeral(config.staking.tier3_threshold).format('0,0') +
              ' WEBD \t ➡️ *' +
              config.staking.yearly_percentage_tier3 +
              '%* per year\n\n';
            resp +=
              'Your must have at least ' +
              numeral(config.staking.tier1_threshold).format('0,0') +
              ' WEBD to get staking rewards.\n\n';
            resp += 'ℹ️ Latest 10 staking rewards:\n\n';

            log.model
              .findAll({
                where: {
                  user_id: found_user.id,
                  event: 'staking',
                },
              })
              .then(function (logs) {
                if (logs.length === 0) {
                  resp += 'No rewards yet, /deposit funds to start staking.';
                }

                var reversed = logs.reverse();

                for (var i = 0; i < reversed.length; i++) {
                  var l = reversed[i];
                  var extra = JSON.parse(l.extra_message);

                  if (i >= 10) {
                    //resp += '\t ...\n';
                    break;
                  }

                  resp +=
                    '\t ➕ New reward: *' +
                    numeral(extra.reward).format('0,0') +
                    '* WEBD (' +
                    l.createdAt.toDateString() +
                    ')\n';
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
    } catch (e) {
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
