import type { ResourceUsagePort } from '../../contracts/index.js';

import { ResourceUsageSnapshot } from '../../resources/index.js';

export class NodeResourceUsageAdapter implements ResourceUsagePort {
  public capture(): ResourceUsageSnapshot {
    const cpu = process.cpuUsage();
    const memory = process.memoryUsage();

    return ResourceUsageSnapshot.fromPrimitives({
      cpuSystemMicroseconds: cpu.system,
      cpuUserMicroseconds: cpu.user,
      heapUsedBytes: memory.heapUsed,
      residentSetBytes: memory.rss,
    });
  }
}
