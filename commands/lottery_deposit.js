const user = require('./../models').user;
const config = require('./../config');
const Webdchain = require('./../services/webdchain');
const Lottery = require('./../services/lottery');
const Telegram = require('./../services/telegram');
const {
  check_private_message,
  check_telegram_username,
  check_and_extract_amount,
  format_number,
} = require('./../utils');

const _ = require('underscore');
const Sequelize = require('sequelize');

module.exports = (bot) => async (msg, match) => {
  console.log(msg.text, msg.chat.id);

  try {
    await check_private_message(msg);
    await check_telegram_username(msg);

    const amount = await check_and_extract_amount(msg);
    const telegram = new Telegram();
    const webdchain = new Webdchain();
    const current_height = await webdchain.get_height();
    const lottery = new Lottery(current_height);
    let resp = '';

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

        const { tickets, price } = await lottery.buy_tickets(
          found_user,
          amount
        );

        resp = `🎟 Bought ${format_number(
          tickets
        )} /lottery_tickets for this round (${format_number(
          price
        )} WEBD / ticket).`;
      } else {
        resp = `You don't have enough /tipbalance to deposit ${amount}.`;
      }
    } else {
      resp = 'Your user can not be found. Create a new acount /start';
    }

    await telegram.send_message(
      msg.chat.id,
      resp,
      Telegram.PARSE_MODE.HTML,
      false
    );
  } catch (e) {
    console.error(e);
  }
};
