import { StackTrace } from '../../src/values/StackTrace.js';

describe(StackTrace.name, () => {
  it('captures an Error stack', () => {
    expect(StackTrace.fromError(new Error('failed')).toString()).toContain(
      'Error: failed',
    );
  });

  it('creates a safe stack for non-Error values', () => {
    expect(StackTrace.fromError('failed').toString()).toContain(
      'A non-Error value was thrown',
    );
  });

  it('falls back when the runtime omits the stack', () => {
    const previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = () => undefined;

    try {
      expect(StackTrace.fromError('failed').toString()).toBe(
        'Stack trace unavailable',
      );
    } finally {
      Error.prepareStackTrace = previousPrepareStackTrace;
    }
  });
});
