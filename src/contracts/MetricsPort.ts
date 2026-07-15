import type { MetricMeasurement } from '../metrics/MetricMeasurement.js';

/**
 * Output port implemented by metrics backends.
 *
 * Implementations must return synchronously. Buffering, batching, and network
 * transport belong inside the adapter.
 */
export interface MetricsPort {
  increment(measurement: MetricMeasurement): void;

  observe(measurement: MetricMeasurement): void;
}
