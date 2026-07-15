import type { MetricsPort } from '../contracts/MetricsPort.js';
import type { MetricMeasurement } from '../metrics/index.js';
import type { RecordedIncrement } from './RecordedIncrement.js';
import type { RecordedObservation } from './RecordedObservation.js';

/** Test double that records all metrics in insertion order. */
export class InMemoryMetricsAdapter implements MetricsPort {
  public readonly increments: RecordedIncrement[] = [];
  public readonly observations: RecordedObservation[] = [];

  public increment(measurement: MetricMeasurement): void {
    this.increments.push(measurement.toPrimitives());
  }

  public observe(measurement: MetricMeasurement): void {
    this.observations.push(measurement.toPrimitives());
  }

  public clear(): void {
    this.increments.length = 0;
    this.observations.length = 0;
  }
}
