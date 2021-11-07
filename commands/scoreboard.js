var sequelize = require('./../models').sequelize,
  _ = require('underscore'),
  numeral = require('numeral');

var Command = function (bot) {
  return function (msg, match) {
    var resp = '';

    console.log(msg.text, msg.chat.id);

    resp = '💰 Top 10 tippers (only public tips are counted):\n\n';

    sequelize
      .query(
        'select sum(amount) as amount, u.telegram_username as username from tips as t left join users as u on u.id = t.from_user where private = 0 group by username order by amount desc limit 10'
      )
      .then(function (results) {
        var tips = results[0];

        for (var i = 0; i < tips.length; i++) {
          resp +=
            '\t\t▫️ ' +
            numeral(tips[i].amount).format('0,0') +
            ' WEBD: ' +
            tips[i].username +
            '\n';
        }

        bot.sendMessage(msg.chat.id, resp, {
          //parse_mode: 'Markdown',
          disable_web_page_preview: true,
          disable_notification: true,
        });

        if (msg.chat.type === 'private') {
          // bot.sendPhoto(
          //   msg.chat.id,
          //   'https://www.hostero.eu/assets/img/tipbot/scoreboard_command.jpg'
          // );
        }
      });
  };
};

module.exports = Command;
