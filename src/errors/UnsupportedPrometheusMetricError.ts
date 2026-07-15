import type { MetricKind } from '../configuration/index.js';

export class UnsupportedPrometheusMetricError extends Error {
  public constructor(kind: MetricKind, operation: 'increment' | 'observe') {
    super(`Prometheus cannot ${operation} metric kind "${kind}"`);
    this.name = new.target.name;
  }
}
