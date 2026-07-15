import { NumberValueObject, PositiveNumber } from '@haskou/value-objects';

export class CpuMicroseconds extends PositiveNumber {
  public constructor(value: number | NumberValueObject) {
    super(value);
  }

  public elapsedSince(startedAt: CpuMicroseconds): CpuMicroseconds {
    if (this.isLessThan(startedAt)) {
      return new CpuMicroseconds(0);
    }

    return new CpuMicroseconds(this.subtract(startedAt));
  }
}
