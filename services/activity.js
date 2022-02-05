const redis = require('redis');
const config = require('./../config');

const DEFAULT_ACTIVITY_INTERVAL_MINUTES = 60;

class Activity {
  constructor() {
    // Do not keep activity more than 7 days
    this.stale_after_minutes = 60 * 24 * 7;

    // TODO: Use redis service
    this.client = redis.createClient(config.redis);

    this.client.on('ready', () => console.log('[ACTIVITY] Redis connected'));
    this.client.on('error', (err) =>
      console.log('[ACTIVITY] Redis Client Error', err)
    );

    this.client.connect();
  }

  async add(
    channel_id,
    user_id,
    user_name,
    message_size = 0,
    time = new Date()
  ) {
    const unix = time.getTime();
    const key = `activity_${channel_id}_${user_id}_${unix}`;

    await this.client.set(
      key,
      JSON.stringify({
        channel_id,
        user_id,
        user_name,
        message_size,
        time,
      })
    );

    await this.client.expire(key, this.stale_after_minutes * 60);
  }

  async get_activities_for_channel(
    channel_id,
    exclude_user_id = null,
    interval_minutes = DEFAULT_ACTIVITY_INTERVAL_MINUTES
  ) {
    const activities = [];

    for await (const key of this.client.scanIterator({
      MATCH: `activity_${channel_id}_*`,
      // COUNT: 1000,
    })) {
      // FIXME: Use the timestamp in key for faster filtration
      const activityRaw = await this.client.get(key);

      try {
        if (!activityRaw) {
          throw new Error('Activity is empty');
        }

        const activity = JSON.parse(activityRaw);

        if (
          new Date(activity.time) >
          new Date(Date.now() - interval_minutes * 60 * 1000)
        ) {
          if (exclude_user_id && exclude_user_id === activity.user_id) {
            continue;
          }

          activities.push(activity);
        }
      } catch (err) {
        console.log(`[ACTIVITY] Error parsing activity: ${err}`);
      }
    }

    return activities;
  }

  group_by_user(activities) {
    return activities.reduce((acc, activity) => {
      if (!acc[activity.user_id]) {
        acc[activity.user_id] = [];
      }

      acc[activity.user_id].push(activity);

      return acc;
    }, {});
  }
}

exports.Activity = Activity;
exports.DEFAULT_ACTIVITY_INTERVAL_MINUTES = DEFAULT_ACTIVITY_INTERVAL_MINUTES;
