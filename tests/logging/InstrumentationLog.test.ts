import { InstrumentationLog } from '../../src/logging/InstrumentationLog.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(InstrumentationLog.name, () => {
  const operation = new OperationName('users.create');

  it('creates called logs', () => {
    const attributes = { service: 'api' };
    const log = InstrumentationLog.called(operation, attributes);

    attributes.service = 'worker';

    expect(log.isFailure()).toBe(false);
    expect(log.toPrimitives()).toEqual({
      attributes: { service: 'api' },
      level: 'called',
      message: 'users.create called',
      operation: 'users.create',
    });
    expect(Object.isFrozen(log.toPrimitives().attributes)).toBe(true);
  });

  it('creates failure logs with optional stack traces', () => {
    const withStack = InstrumentationLog.failed(
      operation,
      {},
      new Error('failed'),
      true,
    );
    const withoutStack = InstrumentationLog.failed(
      operation,
      {},
      new Error('failed'),
      false,
    );

    expect(withStack.isFailure()).toBe(true);
    expect(withStack.toPrimitives().stackTrace).toContain('Error: failed');
    expect(withoutStack.toPrimitives()).not.toHaveProperty('stackTrace');
  });
});
