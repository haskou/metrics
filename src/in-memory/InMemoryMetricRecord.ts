import type { MetricMeasurementPrimitives } from '../metrics/index.js';

export interface InMemoryMetricRecord extends MetricMeasurementPrimitives {
  readonly recordedAt: number;
  readonly type: 'increment' | 'observation';
}
