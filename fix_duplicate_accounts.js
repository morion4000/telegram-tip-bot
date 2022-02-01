const user_model = require('./models').user.model;

async function fix() {
  const users = await user_model.findAll({
    where: {},
    logging: false,
  });

  const users_by_telegram_username = {};

  for (const user of users) {
    if (!users_by_telegram_username[user.telegram_username]) {
      users_by_telegram_username[user.telegram_username] = [];
    }

    users_by_telegram_username[user.telegram_username].push(user);
  }

  for (const key in users_by_telegram_username) {
    const value = users_by_telegram_username[key];

    if (value.length < 2) {
      continue;
    }

    const balance = value[0].balance + value[1].balance;

    if (value[0].telegram_id) {
      await user_model.update(
        {
          balance: balance,
        },
        {
          where: {
            id: value[0].id,
          },
        }
      );

      await user_model.destroy({
        where: {
          id: value[1].id,
        },
      });
    } else if (value[1].telegram_id) {
      await user_model.update(
        {
          balance: balance,
        },
        {
          where: {
            id: value[1].id,
          },
        }
      );

      await user_model.destroy({
        where: {
          id: value[0].id,
        },
      });
    }
  }
}

fix();
