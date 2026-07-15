import type { ResourceUsagePort } from '../contracts/index.js';
import type { ResourceUsagePrimitives } from '../resources/index.js';

import { ResourceUsageSnapshot } from '../resources/index.js';

const emptyUsage: ResourceUsagePrimitives = {
  cpuSystemMicroseconds: 0,
  cpuUserMicroseconds: 0,
  heapUsedBytes: 0,
  residentSetBytes: 0,
};

export class ManualResourceUsageAdapter implements ResourceUsagePort {
  private current: ResourceUsageSnapshot;

  public constructor(primitives: ResourceUsagePrimitives = emptyUsage) {
    this.current = ResourceUsageSnapshot.fromPrimitives(primitives);
  }

  public capture(): ResourceUsageSnapshot {
    return this.current;
  }

  public set(primitives: ResourceUsagePrimitives): void {
    this.current = ResourceUsageSnapshot.fromPrimitives(primitives);
  }
}
