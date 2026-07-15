import { ElapsedMilliseconds } from '../../src/values/ElapsedMilliseconds.js';

describe(ElapsedMilliseconds.name, () => {
  it('calculates elapsed time', () => {
    const elapsed = new ElapsedMilliseconds(25).elapsedSince(
      new ElapsedMilliseconds(10),
    );

    expect(elapsed.isEqual(new ElapsedMilliseconds(15))).toBe(true);
  });

  it('clamps decreasing measurements to zero', () => {
    const elapsed = new ElapsedMilliseconds(10).elapsedSince(
      new ElapsedMilliseconds(20),
    );

    expect(elapsed.isZero()).toBe(true);
  });
});
