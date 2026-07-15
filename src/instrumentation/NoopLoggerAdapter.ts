import type { LoggerPort } from '../contracts/LoggerPort.js';
import type { InstrumentationLog } from '../logging/index.js';

export class NoopLoggerAdapter implements LoggerPort {
  public write(entry: InstrumentationLog): void {
    void entry;
  }
}
