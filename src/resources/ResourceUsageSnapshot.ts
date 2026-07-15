import type { ResourceUsagePrimitives } from './ResourceUsagePrimitives.js';

import {
  CpuMicroseconds,
  MemoryByteDelta,
  MemoryBytes,
} from '../values/index.js';

export class ResourceUsageSnapshot {
  public static fromPrimitives(
    primitives: ResourceUsagePrimitives,
  ): ResourceUsageSnapshot {
    return new ResourceUsageSnapshot(
      new CpuMicroseconds(primitives.cpuUserMicroseconds),
      new CpuMicroseconds(primitives.cpuSystemMicroseconds),
      new MemoryBytes(primitives.residentSetBytes),
      new MemoryBytes(primitives.heapUsedBytes),
    );
  }

  public constructor(
    private readonly cpuUser: CpuMicroseconds,
    private readonly cpuSystem: CpuMicroseconds,
    private readonly residentSet: MemoryBytes,
    private readonly heapUsed: MemoryBytes,
  ) {}

  public getCpuUserSince(startedAt: ResourceUsageSnapshot): CpuMicroseconds {
    return this.cpuUser.elapsedSince(startedAt.cpuUser);
  }

  public getCpuSystemSince(startedAt: ResourceUsageSnapshot): CpuMicroseconds {
    return this.cpuSystem.elapsedSince(startedAt.cpuSystem);
  }

  public getResidentSet(): MemoryBytes {
    return this.residentSet;
  }

  public getResidentSetDeltaSince(
    startedAt: ResourceUsageSnapshot,
  ): MemoryByteDelta {
    return this.residentSet.differenceSince(startedAt.residentSet);
  }

  public getHeapUsed(): MemoryBytes {
    return this.heapUsed;
  }

  public getHeapUsedDeltaSince(
    startedAt: ResourceUsageSnapshot,
  ): MemoryByteDelta {
    return this.heapUsed.differenceSince(startedAt.heapUsed);
  }
}
