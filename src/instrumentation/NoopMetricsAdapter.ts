import type { MetricsPort } from '../contracts/MetricsPort.js';
import type { MetricMeasurement } from '../metrics/index.js';

export class NoopMetricsAdapter implements MetricsPort {
  public increment(measurement: MetricMeasurement): void {
    void measurement;
  }

  public observe(measurement: MetricMeasurement): void {
    void measurement;
  }
}
