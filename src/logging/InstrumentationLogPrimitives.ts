import type { MetricAttributes } from '../contracts/index.js';
import type { InstrumentationErrorPrimitives } from './InstrumentationErrorPrimitives.js';

export interface InstrumentationLogPrimitives {
  readonly attributes: MetricAttributes;
  readonly error?: InstrumentationErrorPrimitives;
  readonly level: string;
  readonly message: string;
  readonly operation: string;
  readonly stackTrace?: string;
}
