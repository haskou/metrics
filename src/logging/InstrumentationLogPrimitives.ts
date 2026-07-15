import type { MetricAttributes } from '../contracts/index.js';

export interface InstrumentationLogPrimitives {
  readonly attributes: MetricAttributes;
  readonly level: string;
  readonly message: string;
  readonly operation: string;
  readonly stackTrace?: string;
}
