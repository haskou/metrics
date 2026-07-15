import { ResourceUsageSnapshot } from '../../src/resources/ResourceUsageSnapshot.js';
import { CpuMicroseconds } from '../../src/values/CpuMicroseconds.js';
import { MemoryByteDelta } from '../../src/values/MemoryByteDelta.js';
import { MemoryBytes } from '../../src/values/MemoryBytes.js';

describe(ResourceUsageSnapshot.name, () => {
  it('calculates CPU and memory changes', () => {
    const started = ResourceUsageSnapshot.fromPrimitives({
      cpuSystemMicroseconds: 10,
      cpuUserMicroseconds: 20,
      heapUsedBytes: 100,
      residentSetBytes: 200,
    });
    const finished = ResourceUsageSnapshot.fromPrimitives({
      cpuSystemMicroseconds: 13,
      cpuUserMicroseconds: 25,
      heapUsedBytes: 90,
      residentSetBytes: 220,
    });

    expect(
      finished.getCpuUserSince(started).isEqual(new CpuMicroseconds(5)),
    ).toBe(true);
    expect(
      finished.getCpuSystemSince(started).isEqual(new CpuMicroseconds(3)),
    ).toBe(true);
    expect(finished.getResidentSet().isEqual(new MemoryBytes(220))).toBe(true);
    expect(finished.getHeapUsed().isEqual(new MemoryBytes(90))).toBe(true);
    expect(
      finished
        .getResidentSetDeltaSince(started)
        .isEqual(new MemoryByteDelta(20)),
    ).toBe(true);
    expect(
      finished.getHeapUsedDeltaSince(started).isEqual(new MemoryByteDelta(-10)),
    ).toBe(true);
  });
});
