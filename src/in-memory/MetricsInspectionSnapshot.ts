import type { InMemoryLogRecord } from './InMemoryLogRecord.js';
import type { InMemoryMetricRecord } from './InMemoryMetricRecord.js';

export interface MetricsInspectionSnapshot {
  readonly capacity: Readonly<{ logs: number; metrics: number }>;
  readonly discarded: Readonly<{ logs: number; metrics: number }>;
  readonly logs: readonly InMemoryLogRecord[];
  readonly metrics: readonly InMemoryMetricRecord[];
}
