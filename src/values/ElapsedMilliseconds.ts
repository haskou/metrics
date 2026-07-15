import { NumberValueObject, PositiveNumber } from '@haskou/value-objects';

export class ElapsedMilliseconds extends PositiveNumber {
  public constructor(value: number | NumberValueObject) {
    super(value);
  }

  public elapsedSince(startedAt: ElapsedMilliseconds): ElapsedMilliseconds {
    if (this.isLessThan(startedAt)) {
      return new ElapsedMilliseconds(0);
    }

    return new ElapsedMilliseconds(this.subtract(startedAt));
  }
}
