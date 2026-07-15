import { SystemClock } from '../../../src/adapters/system/SystemClock.js';

describe(SystemClock.name, () => {
  it('returns monotonic elapsed milliseconds', () => {
    expect(new SystemClock().now().isGreaterOrEqualThan(0)).toBe(true);
  });
});
