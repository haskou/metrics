import { NoopLoggerAdapter } from '../../src/instrumentation/NoopLoggerAdapter.js';
import { InstrumentationLog } from '../../src/logging/InstrumentationLog.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(NoopLoggerAdapter.name, () => {
  it('ignores structured logs', () => {
    const adapter = new NoopLoggerAdapter();

    expect(() =>
      adapter.write(
        InstrumentationLog.called(new OperationName('users.create'), {}),
      ),
    ).not.toThrow();
  });
});
