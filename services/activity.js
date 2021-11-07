module.exports = class Activity {
  constructor() {
    this.activity = {};
    this.period = 60;
    this.stale_after_minutes = 60;
  }

  get channels() {
    return Object.keys(this.activity);
  }

  get size() {
    let size = 0;

    for (const channel_id of this.channels) {
      size += this.get_size_of_channel(channel_id);
    }

    return size;
  }

  get_users_in_channel(channel_id) {
    if (!this.channel_exists(channel_id)) {
      return [];
    }

    return Object.keys(this.activity[channel_id]);
  }

  get_size_of_channel(channel_id) {
    if (!this.channel_exists(channel_id)) {
      return 0;
    }

    return Object.keys(this.activity[channel_id]).length;
  }

  get_active_users_for_channel(channel_id) {
    // TODO: Check last_active_at
    return this.get_users_in_channel(channel_id).filter(
      (user) => user.messages > 0
    );
  }

  channel_exists(channel_id) {
    return this.activity.hasOwnProperty(channel_id);
  }

  user_exists_on_channel(user_id, channel_id) {
    return (
      this.channel_exists(channel_id) &&
      this.activity[channel_id].hasOwnProperty(user_id)
    );
  }

  remove_stale_activity() {
    for (const channel_id of this.channels) {
      for (const user_id of this.get_users_in_channel(channel_id)) {
        if (this.activity[channel_id][user_id] < Date.now() - 1000 * 60 * 60) {
          delete this.activity[channel_id][user_id];
        }
      }
    }
  }

  add_activity_for_user_on_channel(user_id, channel_id) {
    if (!this.channel_exists(channel_id)) {
      this.activity[channel_id] = {};
    }

    if (!this.user_exists_on_channel(user_id, channel_id)) {
      this.activity[channel_id][user_id] = {
        messages: 1,
        last_message_at: new Date(),
      };
    } else {
      this.activity[channel_id][user_id].messages++;
      this.activity[channel_id][user_id].last_message_at = new Date();
    }
  }
};
