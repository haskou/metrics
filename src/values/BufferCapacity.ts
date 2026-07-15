import { Integer, NumberValueObject } from '@haskou/value-objects';

import { InvalidBufferCapacityError } from '../errors/index.js';

export class BufferCapacity extends Integer {
  public constructor(value: number | NumberValueObject) {
    super(value);

    if (this.isLessOrEqualThan(0)) {
      throw new InvalidBufferCapacityError();
    }
  }
}
