import { InstrumentationLogLevel } from '../../src/logging/InstrumentationLogLevel.js';

describe(InstrumentationLogLevel.name, () => {
  it('identifies failure levels', () => {
    expect(InstrumentationLogLevel.FAILED.isFailure()).toBe(true);
    expect(InstrumentationLogLevel.CALLED.isFailure()).toBe(false);
  });

  it('declares the supported values', () => {
    expect(InstrumentationLogLevel.CALLED.getValues()).toEqual([
      'called',
      'failed',
    ]);
  });
});
