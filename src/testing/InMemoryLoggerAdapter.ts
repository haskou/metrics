import type { LoggerPort } from '../contracts/LoggerPort.js';
import type { InstrumentationLog } from '../logging/InstrumentationLog.js';
import type { InstrumentationLogPrimitives } from '../logging/InstrumentationLogPrimitives.js';

export class InMemoryLoggerAdapter implements LoggerPort {
  public readonly entries: InstrumentationLogPrimitives[] = [];

  public write(entry: InstrumentationLog): void {
    this.entries.push(entry.toPrimitives());
  }

  public clear(): void {
    this.entries.length = 0;
  }
}
