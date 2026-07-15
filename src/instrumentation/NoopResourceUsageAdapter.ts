import type { ResourceUsagePort } from '../contracts/index.js';

import { ResourceUsageSnapshot } from '../resources/index.js';

const emptySnapshot = ResourceUsageSnapshot.fromPrimitives({
  cpuSystemMicroseconds: 0,
  cpuUserMicroseconds: 0,
  heapUsedBytes: 0,
  residentSetBytes: 0,
});

export class NoopResourceUsageAdapter implements ResourceUsagePort {
  public capture(): ResourceUsageSnapshot {
    return emptySnapshot;
  }
}
