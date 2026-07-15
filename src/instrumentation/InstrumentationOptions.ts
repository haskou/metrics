import type { MetricAttributes } from '../contracts/index.js';

export interface InstrumentationOptions {
  readonly attributes?: MetricAttributes;
  readonly captureStackTrace?: boolean;
  readonly logCalls?: boolean;
  readonly logFailures?: boolean;
  readonly recordCalls?: boolean;
  readonly recordCpu?: boolean;
  readonly recordDuration?: boolean;
  readonly recordFailures?: boolean;
  readonly recordMemory?: boolean;
}
