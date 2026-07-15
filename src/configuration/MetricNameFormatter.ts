import type { MetricKind } from './MetricKind.js';

export type MetricNameFormatter = (
  operationName: string,
  kind: MetricKind,
) => string;
