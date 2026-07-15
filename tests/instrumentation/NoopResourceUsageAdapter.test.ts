import { NoopResourceUsageAdapter } from '../../src/instrumentation/NoopResourceUsageAdapter.js';

describe(NoopResourceUsageAdapter.name, () => {
  it('returns an empty resource snapshot', () => {
    const snapshot = new NoopResourceUsageAdapter().capture();

    expect(snapshot.getCpuUserSince(snapshot).isZero()).toBe(true);
    expect(snapshot.getHeapUsed().isZero()).toBe(true);
  });
});
