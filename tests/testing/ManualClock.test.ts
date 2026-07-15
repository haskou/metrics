import { ManualClock } from '../../src/testing/ManualClock.js';
import { ElapsedMilliseconds } from '../../src/values/ElapsedMilliseconds.js';

describe(ManualClock.name, () => {
  it('sets and advances deterministic time', () => {
    const clock = new ManualClock(4);

    clock.set(20);
    clock.advance(2);

    expect(clock.now().isEqual(new ElapsedMilliseconds(22))).toBe(true);
  });
});
