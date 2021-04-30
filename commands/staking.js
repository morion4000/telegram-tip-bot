var user = require('./../models').user,
  log = require('./../models').log,
  config = require('./../config'),
  numeral = require('numeral'),
  moment = require('moment'),
  Sequelize = require('sequelize');

var Command = function (bot) {
  return function (msg, match) {
    try {
      var resp = '';

      console.log(msg.text, msg.chat.id);

      if (
        msg.chat.type !== 'private' &&
        !config.public_channels.includes(msg.chat.id)
      ) {
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
              '📈 The staking reward is *' +
              config.staking.yearly_percentage +
              '%* per year, received daily.\n\n';
            resp +=
              'You must have at least ' +
              numeral(config.staking.threshold).format('0,0') +
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

                  const reward_usd = extra.reward_usd || 0;

                  resp +=
                    '\t ✅  (' +
                    moment(l.createdAt).format('L') +
                    ') New reward: *' +
                    numeral(extra.reward).format('0,0') +
                    '* WEBD ($' +
                    numeral(reward_usd).format('0,0.00') +
                    ')\n';
                }

                //resp += '\nFor bigger staking rewards we recommend: https://www.hostero.eu/docs/webdollar-pos-mining';

                bot.sendMessage(msg.chat.id, resp, {
                  parse_mode: 'Markdown',
                  disable_web_page_preview: true,
                  disable_notification: true,
                });

                bot.sendPhoto(
                  msg.chat.id,
                  'https://www.hostero.eu/assets/img/tipbot/staking_command.jpg'
                );
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
