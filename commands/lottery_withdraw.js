const user = require('./../models').user;
const config = require('./../config');
const _ = require('underscore');
const Sequelize = require('sequelize');

const Command = function (bot) {
  return async function (msg, match) {
    console.log(msg.text, msg.chat.id);

    if (
      msg.chat.type !== 'private' &&
      !config.public_channels.includes(msg.chat.id)
    ) {
      bot.sendMessage(
        msg.chat.id,
        'Private command. Please DM the bot: @webdollar_tip_bot to use the command.',
        {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        }
      );

      return;
    }

    if (!msg.from.username) {
      bot.sendMessage(
        msg.chat.id,
        'Please set an username for your telegram account to use the bot.',
        {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        }
      );

      return;
    }

    const amount_match = msg.text.match(/ [0-9]+/);
    let amount = amount_match ? amount_match[0] : 0; // 0 = withdraw all
    let resp = 'Not implemented';

    if (_.isString(amount)) {
      amount = amount.trim();
    }

    amount = parseInt(amount);

    const found_user = await user.model.findOne({
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
    });

    if (found_user) {
      if (amount === 0) {
        amount = found_user.balance_lottery;
      }

      if (found_user.balance_lottery >= amount) {
        await user.model.update(
          {
            balance_lottery: found_user.balance_lottery - amount,
            balance_lottery_withdraw:
              found_user.balance_lottery_withdraw + amount,
          },
          {
            where: {
              id: found_user.id,
            },
          }
        );

        resp = `Withdrew ${amount} from lottery balance. The amount will be credited to your /tipbalance when the /lottery rounds ends.`;
      } else {
        resp = `You don't have enough balance to withdraw ${amount}. Your lottery balance is ${found_user.balance_lottery}`;
      }
    } else {
      resp = 'Your user can not be found. Create a new acount /start';
    }

    bot.sendMessage(msg.chat.id, resp, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  };
};

module.exports = Command;
