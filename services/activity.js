const redis = require('redis');
const config = require('./../config');

const DEFAULT_ACTIVITY_INTERVAL_MINUTES = 60;

class Activity {
  constructor() {
    this.activities = [];
    this.stale_after_minutes = 60 * 24 * 7; // Do not keep activity more than 7 days
    this.clean_interval_ms = 30 * 60 * 1000; // Clean every half an hour

    // TODO: Use redis service
    this.client = redis.createClient(config.redis);

    this.client.on('ready', () => console.log('[ACTIVITY] Redis connected'));
    this.client.on('error', (err) =>
      console.log('[ACTIVITY] Redis Client Error', err)
    );

    this.client.connect();
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

  watch() {
    console.log(`[ACTIVITY] Started watching: ${this.clean_interval_ms}ms`);

    this.clean_interval = setInterval(() => {
      const old_size = this.size;

      this.clean();

      console.log(`[ACTIVITY] Ran clean: ${old_size} => ${this.size}`);
    }, this.clean_interval_ms);
  }

  prune() {
    this.activities = [];
  }

  clean() {
    this.activities = this.activities.filter(
      (activity) =>
        activity.time >
        new Date(Date.now() - this.stale_after_minutes * 60 * 1000)
    );
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

    this.activities.push({
      channel_id,
      user_id,
      user_name,
      message_size,
      time,
    });
  }

  async get_activities_for_channel(
    channel_id,
    exclude_user_id = null,
    interval_minutes = DEFAULT_ACTIVITY_INTERVAL_MINUTES
  ) {
    // this.client.keys(`activity_${channel_id}_*`, (err, keys) => {
    //   if (err) {
    //     console.log(`[ACTIVITY] Error getting keys: ${err}`);
    //     return;
    //   }
    // });

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
