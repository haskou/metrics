import type { LoggerPort } from '../contracts/LoggerPort.js';
import type { InstrumentationLog } from '../logging/InstrumentationLog.js';
import type { InMemoryLogRecord } from './InMemoryLogRecord.js';

import { BufferCapacity } from '../values/index.js';
import { BoundedBuffer } from './BoundedBuffer.js';
import { DEFAULT_IN_MEMORY_CAPACITY } from './DefaultInMemoryCapacity.js';

export class BoundedInMemoryLoggerAdapter implements LoggerPort {
  private readonly records: BoundedBuffer<InMemoryLogRecord>;

  public constructor(capacity = DEFAULT_IN_MEMORY_CAPACITY) {
    this.records = new BoundedBuffer(new BufferCapacity(capacity));
  }

  public write(entry: InstrumentationLog): void {
    this.records.push(
      Object.freeze({
        ...entry.toPrimitives(),
        recordedAt: Date.now(),
      }),
    );
  }

  public snapshot(): readonly InMemoryLogRecord[] {
    return this.records.toArray();
  }

  public clear(): void {
    this.records.clear();
  }

  public getCapacity(): number {
    return this.records.getCapacity();
  }

  public getDiscarded(): number {
    return this.records.getDiscarded();
  }
}
