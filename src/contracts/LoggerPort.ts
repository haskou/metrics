import type { InstrumentationLog } from '../logging/InstrumentationLog.js';

export interface LoggerPort {
  write(entry: InstrumentationLog): void;
}
