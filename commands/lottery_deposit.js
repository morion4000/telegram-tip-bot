const user = require('./../models').user;
const config = require('./../config');
const { format_number, convert_to_usd } = require('./../utils');
const Lottery = require('./../services/lottery');

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

    if (amount_match === null) {
      bot.sendMessage(
        msg.chat.id,
        'Please specify an amount: /lottery_deposit 1000',
        {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        }
      );

      return;
    }

    const lottery = new Lottery();
    let resp = 'Not implemented';
    let amount = amount_match[0];

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
      if (found_user.balance >= amount) {
        await user.model.update(
          {
            balance: found_user.balance - amount,
            balance_lottery: amount,
          },
          {
            where: {
              id: found_user.id,
            },
          }
        );

        const { tickets, price, range_min, range_max } =
          await lottery.buy_tickets(found_user, amount);

        resp = `🎟 Bought ${format_number(tickets)} tickets (${format_number(price)} WEBD / ticket). Numbers: ${range_min} - ${range_max}`;
      } else {
        resp = `You don't have enough /tipbalance to deposit ${amount}.`;
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
