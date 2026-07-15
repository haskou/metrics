import type { InstrumentationLogPrimitives } from '../logging/index.js';

export interface InMemoryLogRecord extends InstrumentationLogPrimitives {
  readonly recordedAt: number;
}
