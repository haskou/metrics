import type { MetricsPort } from '../contracts/index.js';
import type { InMemoryMetricRecord } from './InMemoryMetricRecord.js';

import { MetricMeasurement } from '../metrics/index.js';
import { BufferCapacity } from '../values/index.js';
import { BoundedBuffer } from './BoundedBuffer.js';
import { DEFAULT_IN_MEMORY_CAPACITY } from './DefaultInMemoryCapacity.js';

export class BoundedInMemoryMetricsAdapter implements MetricsPort {
  private readonly records: BoundedBuffer<InMemoryMetricRecord>;

  public constructor(capacity = DEFAULT_IN_MEMORY_CAPACITY) {
    this.records = new BoundedBuffer(new BufferCapacity(capacity));
  }

  private record(
    type: InMemoryMetricRecord['type'],
    measurement: MetricMeasurement,
  ): void {
    this.records.push(
      Object.freeze({
        ...measurement.toPrimitives(),
        recordedAt: Date.now(),
        type,
      }),
    );
  }

  public increment(measurement: MetricMeasurement): void {
    this.record('increment', measurement);
  }

  public observe(measurement: MetricMeasurement): void {
    this.record('observation', measurement);
  }

  public snapshot(): readonly InMemoryMetricRecord[] {
    return this.records.toArray();
  }

  public clear(): void {
    this.records.clear();
  }

  public getCapacity(): number {
    return this.records.getCapacity();
  }

  public getDiscarded(): number {
    return this.records.getDiscarded();
  }
}
