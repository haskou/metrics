import { Enum } from '@haskou/value-objects';

const levels = {
  CALLED: 'called',
  FAILED: 'failed',
} as const;

export class InstrumentationLogLevel extends Enum<string> {
  public static readonly CALLED = new InstrumentationLogLevel(levels.CALLED);
  public static readonly FAILED = new InstrumentationLogLevel(levels.FAILED);

  private constructor(value: string) {
    super(value);
  }

  public getValues(): string[] {
    return Object.values(levels);
  }

  public isFailure(): boolean {
    return this.isEqual(InstrumentationLogLevel.FAILED);
  }
}
