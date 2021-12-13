const { Activity, DEFAULT_ACTIVITY_INTERVAL_MINUTES } = require('./activity');

describe('Activity', () => {
  const activity = new Activity();
  const channel_id = '21421421421';
  const channel_id2 = '24145464664';
  const user_id = '1';
  const user_id2 = '2';
  const user_name = 'test';

  beforeEach(() => {
    activity.prune();

    activity.add(channel_id, user_id);
  });

  it('should get size', () => {
    expect(activity.size).toBe(1);

    activity.add(channel_id, user_id);

    expect(activity.size).toBe(2);
  });

  it('should get channels', () => {
    expect(activity.channels).toBe(1);

    activity.add(channel_id2, user_id);

    expect(activity.channels).toBe(2);
  });

  it('should get last activity', () => {
    expect(activity.last_activity).toBe(activity.activities[0]);
  });

  it('should clean', () => {
    activity.add(
      channel_id,
      user_id,
      user_name,
      new Date(Date.now() - activity.stale_after_minutes * 60 * 1000)
    );

    expect(activity.size).toBe(2);

    activity.clean();

    expect(activity.size).toBe(1);
  });

  it('should get activities for channel', () => {
    activity.add(channel_id2, user_id, user_name);
    activity.add(
      channel_id,
      user_id,
      user_name,
      new Date(Date.now() - DEFAULT_ACTIVITY_INTERVAL_MINUTES * 60 * 1000)
    );

    expect(activity.get_activities_for_channel(channel_id).length).toBe(1);
    expect(
      activity.get_activities_for_channel(
        channel_id,
        null,
        DEFAULT_ACTIVITY_INTERVAL_MINUTES + 1
      ).length
    ).toBe(2);

    expect(
      activity.get_activities_for_channel(
        channel_id,
        user_id2,
        DEFAULT_ACTIVITY_INTERVAL_MINUTES + 1
      ).length
    ).toBe(2);

    expect(
      activity.get_activities_for_channel(
        channel_id,
        user_id,
        DEFAULT_ACTIVITY_INTERVAL_MINUTES + 1
      ).length
    ).toBe(0);
  });

  it('should get activities for channel grouped by user', () => {
    activity.add(channel_id, user_id2, user_name);

    const activities =
      activity.get_activities_for_channel_grouped_by_user(channel_id);

    expect(Object.keys(activities).length).toBe(2);
  });
});
