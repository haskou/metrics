import type { ResourceUsagePort } from '../../contracts/ResourceUsagePort.js';

// Portable runtimes do not provide process-wide CPU or memory measurements.
export const defaultResourceUsage: ResourceUsagePort | undefined = undefined;
