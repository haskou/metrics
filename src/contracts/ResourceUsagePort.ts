import type { ResourceUsageSnapshot } from '../resources/index.js';

export interface ResourceUsagePort {
  capture(): ResourceUsageSnapshot;
}
