const Activity = require('./Activity');

const user_mock = { id: 1 };

describe('Activity', () => {
  it('should init', () => {
    const activity = new Activity();

    expect(activity).toBeDefined();
    expect(activity.size).toBe(0);
  });

  it('should get size', () => {
    const activity = new Activity();

    activity.add('test', user_mock);

    expect(activity.size).toBe(1);

    activity.add('test', user_mock);

    expect(activity.size).toBe(1);

    activity.add('test2', user_mock);

    expect(activity.size).toBe(2);
  });

  it('should get total_size', () => {
    const activity = new Activity();

    activity.add('test', user_mock);

    expect(activity.total_size).toBe(1);

    activity.add('test', user_mock);

    expect(activity.total_size).toBe(2);
  });
});
