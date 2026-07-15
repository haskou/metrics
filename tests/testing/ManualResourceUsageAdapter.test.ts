import { ManualResourceUsageAdapter } from '../../src/testing/ManualResourceUsageAdapter.js';
import { MemoryBytes } from '../../src/values/MemoryBytes.js';

describe(ManualResourceUsageAdapter.name, () => {
  it('starts empty and accepts deterministic snapshots', () => {
    const adapter = new ManualResourceUsageAdapter();
    expect(adapter.capture().getHeapUsed().isZero()).toBe(true);

    adapter.set({
      cpuSystemMicroseconds: 1,
      cpuUserMicroseconds: 2,
      heapUsedBytes: 3,
      residentSetBytes: 4,
    });

    expect(adapter.capture().getHeapUsed().isEqual(new MemoryBytes(3))).toBe(
      true,
    );
  });
});
