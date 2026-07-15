import { NumberValueObject, PositiveNumber } from '@haskou/value-objects';

import { MemoryByteDelta } from './MemoryByteDelta.js';

export class MemoryBytes extends PositiveNumber {
  public constructor(value: number | NumberValueObject) {
    super(value);
  }

  public differenceSince(startedAt: MemoryBytes): MemoryByteDelta {
    return new MemoryByteDelta(new NumberValueObject(this).subtract(startedAt));
  }
}
