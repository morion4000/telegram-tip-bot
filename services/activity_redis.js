const redis = require('redis');
const config = require('./../config');

const DEFAULT_ACTIVITY_INTERVAL_MINUTES = 60;

class Activity {
  constructor() {
    this.client = redis.createClient(config.redis.connection_string);

    this.stale_after_minutes = 60 * 12; // Do not keep activity more than 12 hours
    this.clean_interval_ms = 30 * 60 * 1000; // Clean every half an hour

    this.client.on('error', (err) => console.log('Redis Client Error', err));

    await this.client.connect();
  }

  get size() {
    return this.activities.length;
  }

  get channels() {
    return [...new Set(this.activities.map((a) => a.channel_id))].length;
  }

  get last_activity() {
    return this.activities[this.activities.length - 1];
  }

  add(channel_id, user_id, user_name, message_size = 0, time = new Date()) {
    this.client.hSet(
      channel_id,
      user_id,
      JSON.stringify({
        channel_id: channel_id,
        user_id: user_id,
        user_name: user_name,
        message_size: message_size,
        time: time,
      })
    );

    // this.client.expire(`activity`, DEFAULT_ACTIVITY_INTERVAL_MINUTES * 60);
  }

  get_activities_for_channel(
    channel_id,
    exclude_user_id = null,
    interval_minutes = DEFAULT_ACTIVITY_INTERVAL_MINUTES
  ) {
    return this.activities.filter(
      (activity) =>
        activity.channel_id === channel_id &&
        activity.user_id !== exclude_user_id &&
        activity.time > new Date(Date.now() - interval_minutes * 60 * 1000)
    );
  }

  get_activities_for_channel_grouped_by_user(
    channel_id,
    exclude_user_id = null,
    interval_minutes = DEFAULT_ACTIVITY_INTERVAL_MINUTES
  ) {
    return this.get_activities_for_channel(
      channel_id,
      exclude_user_id,
      interval_minutes
    ).reduce((acc, activity) => {
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
