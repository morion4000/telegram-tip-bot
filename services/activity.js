const DEFAULT_ACTIVITY_INTERVAL_MINUTES = 60;

class Activity {
  constructor() {
    this.activities = [];
    this.stale_after_minutes = 60 * 6; // Do not keep activity more than 6 hours
    this.clean_interval_ms = 30 * 60 * 1000;
  }

  get size() {
    return this.activities.length;
  }

  get channels() {
    return [...new Set(this.activities.map((a) => a.channel))].length;
  }

  get last_activity() {
    return this.activities[this.activities.length - 1];
  }

  watch() {
    this.clean_interval = setInterval(
      () => this.clean(),
      this.clean_interval_ms
    );
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

  add(channel, user, message, time = new Date()) {
    this.activities.push({
      channel,
      user,
      message,
      time,
    });
  }

  get_activities_for_channel(
    channel,
    interval_minutes = DEFAULT_ACTIVITY_INTERVAL_MINUTES
  ) {
    return this.activities.filter(
      (activity) =>
        activity.channel === channel &&
        activity.time > new Date(Date.now() - interval_minutes * 60 * 1000)
    );
  }

  get_activities_for_channel_and_user(
    channel,
    user,
    interval_minutes = DEFAULT_ACTIVITY_INTERVAL_MINUTES
  ) {
    return this.activities.filter(
      (activity) =>
        activity.channel === channel &&
        activity.user === user &&
        activity.time > new Date(Date.now() - interval_minutes * 60 * 1000)
    );
  }
}

exports.Activity = Activity;
exports.DEFAULT_ACTIVITY_INTERVAL_MINUTES = DEFAULT_ACTIVITY_INTERVAL_MINUTES;
