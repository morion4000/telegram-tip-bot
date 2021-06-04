Duplicate users:

- `select telegram_id, count(*) from users group by telegram_id having count(*) > 1`
- `select telegram_username, count(*) from users group by telegram_username having count(*) > 1`
