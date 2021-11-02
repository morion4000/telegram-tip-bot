const user = require('./../models').user;
const config = require('./../config');
const { format_number } = require('./../utils');
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const Telegram = require('./../services/telegram');

const _ = require('underscore');
const Sequelize = require('sequelize');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  const telegram = new Telegram();

  if (
    msg.chat.type !== 'private' &&
    !config.public_channels.includes(msg.chat.id)
  ) {
    telegram
      .send_message(
        msg.chat.id,
        'Private command. Please DM the bot: @webdollar_tip_bot to use the command.',
        Telegram.PARSE_MODE.MARKDOWN,
        false
      )
      .catch(console.error);

    return;
  }

  if (!msg.from.username) {
    telegram
      .send_message(
        msg.chat.id,
        'Please set an username for your telegram account to use the bot.',
        Telegram.PARSE_MODE.MARKDOWN,
        false
      )
      .catch(console.error);

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

  const webdchain = new Webdchain();
  const current_height = await webdchain.get_height();
  const lottery = new Lottery(current_height);

  let resp = '';
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

      const { tickets, price } = await lottery.buy_tickets(found_user, amount);

      resp = `🎟 Bought *${format_number(
        tickets
      )}* /lottery_tickets for this round (${format_number(
        price
      )} WEBD / ticket).`;
    } else {
      resp = `You don't have enough /tipbalance to deposit ${amount}.`;
    }
  } else {
    resp = 'Your user can not be found. Create a new acount /start';
  }

  telegram
    .send_message(msg.chat.id, resp, Telegram.PARSE_MODE.MARKDOWN, false)
    .catch(console.error);
};
