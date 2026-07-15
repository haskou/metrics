import { CpuMicroseconds } from '../../src/values/CpuMicroseconds.js';

describe(CpuMicroseconds.name, () => {
  it('calculates elapsed CPU time', () => {
    const elapsed = new CpuMicroseconds(30).elapsedSince(
      new CpuMicroseconds(12),
    );

    expect(elapsed.isEqual(new CpuMicroseconds(18))).toBe(true);
  });

  it('clamps decreasing measurements to zero', () => {
    const elapsed = new CpuMicroseconds(10).elapsedSince(
      new CpuMicroseconds(20),
    );

    expect(elapsed.isZero()).toBe(true);
  });
});
