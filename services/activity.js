module.exports = class Activity {
  constructor() {
    this.channels = new Map();
  }

  build_activity(user, channel) {
    return {
      user: user,
      channel: channel,
      messages: 0,
      last_message_at: new Date(),
    };
  }

  get size() {
    return this.channels.size;
  }

  get total_size() {
    let size = 0;

    for (const channel of this.channels.values()) {
      size += channel.size;
    }

    return size;
  }

  add(channel, user) {
    const activities = this.get(channel);

    const activity = activities.has(user.id)
      ? activities.get(user.id)
      : this.build_activity(user, channel);

    activity.messages++;
    activity.last_message_at = new Date();

    activities.set(user.id, activity);

    this.channels.set(channel.id, activities);
  }

  get(channel) {
    return this.channels.has(channel.id)
      ? this.channels.get(channel.id)
      : new Map();
  }

  // TODO: Can I use filter?
  get_last_60_minutes(channel) {
    const activities = new Map([...this.get(channel)]);

    for (const [key, value] of activities) {
      if (value.last_message_at < new Date(Date.now() - 60 * 60 * 1000)) {
        activities.delete(key);
      }
    }

    return activities;
  }
};
