const { Activity, DEFAULT_ACTIVITY_INTERVAL_MINUTES } = require('./Activity');

describe('Activity', () => {
  const activity = new Activity();
  const user_mock = { id: 1 };
  const user_mock2 = { id: 2 };
  const message_mock = { id: 1 };

  beforeEach(() => {
    activity.prune();

    activity.add('test', user_mock, message_mock);
  });

  it('should get size', () => {
    expect(activity.size).toBe(1);

    activity.add('test', user_mock, message_mock);

    expect(activity.size).toBe(2);
  });

  it('should get channels', () => {
    expect(activity.channels).toBe(1);

    activity.add('test2', user_mock, message_mock);

    expect(activity.channels).toBe(2);
  });

  it('should get last activity', () => {
    expect(activity.last_activity).toBe(activity.activities[0]);
  });

  it('should clean', () => {
    activity.add(
      'test',
      user_mock,
      message_mock,
      new Date(Date.now() - activity.stale_after_minutes * 60 * 1000)
    );

    expect(activity.size).toBe(2);

    activity.clean();

    expect(activity.size).toBe(1);
  });

  it('should get activities for channel', () => {
    activity.add('test2', user_mock, message_mock);
    activity.add(
      'test',
      user_mock,
      message_mock,
      new Date(Date.now() - DEFAULT_ACTIVITY_INTERVAL_MINUTES * 60 * 1000)
    );

    expect  (activity.get_activities_for_channel('test').length).toBe(1);
    expect(
      activity.get_activities_for_channel(
        'test',
        DEFAULT_ACTIVITY_INTERVAL_MINUTES + 1
      ).length
    ).toBe(2);
  });
});
