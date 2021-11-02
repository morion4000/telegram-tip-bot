const user = require('./../models').user;
const Telegram = require('./../services/telegram');
const Lottery = require('./../services/lottery');
const Webdchain = require('./../services/webdchain');
const config = require('./../config');

const _ = require('underscore');
const Sequelize = require('sequelize');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  const telegram = new Telegram();
  const webdchain = new Webdchain();
  const current_height = await webdchain.get_height();
  const lottery = new Lottery(current_height);

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

    // TODO: Implement lottery.sell_tickets

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

  telegram
    .send_message(msg.chat.id, resp, Telegram.PARSE_MODE.MARKDOWN, false)
    .catch(console.error);
};
