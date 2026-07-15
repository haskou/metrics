import { StringValueObject } from '@haskou/value-objects';

import { InvalidOperationNameError } from '../errors/index.js';

export class OperationName extends StringValueObject {
  private static readonly MAX_LENGTH = 256;

  public constructor(value: string | StringValueObject) {
    super(value, OperationName.MAX_LENGTH);

    if (this.value.trim().length === 0) {
      throw new InvalidOperationNameError();
    }
  }

  public prefixedBy(prefix?: string): OperationName {
    return prefix ? new OperationName(`${prefix}.${this.value}`) : this;
  }
}
