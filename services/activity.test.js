const Activity = require('./Activity');

describe('Activity', () => {
  const activity = new Activity();
  const user_mock = { id: 1 };
  const user_mock2 = { id: 2 };

  beforeAll(() => {
    activity.add('test', user_mock);
  });

  it('should init', () => {
    expect(activity).toBeDefined();
  });

  it('should get size', () => {
    expect(activity.size).toBe(1);

    activity.add('test', user_mock);

    expect(activity.size).toBe(1);

    activity.add('test2', user_mock);

    //expect(activity.size).toBe(2);
  });

  it('should get total_size', () => {
    expect(activity.total_size).toBe(1);

    activity.add('test', user_mock);

    //expect(activity.total_size).toBe(2);
  });

  it('should get messages for last 60 minutes', () => {
    expect(activity.get_last_60_minutes('test').size).toBe(1);

    activity.add('test', user_mock2, new Date(Date.now() - 2 * 60 * 60 * 1000));

    expect(activity.get_last_60_minutes('test').size).toBe(1);

    activity.add('test', user_mock2);

    expect(activity.get_last_60_minutes('test').size).toBe(2);

    console.log(activity.get_last_60_minutes('test'));
  });
});
