import type { Registry } from 'prom-client';

export interface PrometheusMetricsAdapterOptions {
  readonly attributeNames?: readonly string[];
  readonly cpuBucketsSeconds?: readonly number[];
  readonly durationBucketsSeconds?: readonly number[];
  readonly prefix?: string;
  readonly registry: Registry;
}
