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
    const error = new Error('failed');
    error.name = 'ValidationError';
    Object.assign(error, { code: 'INVALID_EMAIL' });
    const withStack = InstrumentationLog.failed(operation, {}, error, true);
    const withoutStack = InstrumentationLog.failed(
      operation,
      {},
      new Error('failed'),
      false,
    );

    expect(withStack.isFailure()).toBe(true);
    expect(withStack.toPrimitives().error).toMatchObject({
      code: 'INVALID_EMAIL',
      message: 'failed',
      name: 'ValidationError',
    });
    expect(withStack.toPrimitives().error?.stack).toContain('Error: failed');
    expect(withStack.toPrimitives().stackTrace).toContain('Error: failed');
    expect(withoutStack.toPrimitives().error).toEqual({
      message: 'failed',
      name: 'Error',
    });
    expect(withoutStack.toPrimitives()).not.toHaveProperty('stackTrace');
  });

  it('serializes numeric error codes', () => {
    const error = Object.assign(new Error('failed'), { code: 400 });
    const log = InstrumentationLog.failed(operation, {}, error, false);

    expect(log.toPrimitives().error).toEqual({
      code: '400',
      message: 'failed',
      name: 'Error',
    });
  });

  it('creates structured failure logs for non-error thrown values', () => {
    const log = InstrumentationLog.failed(operation, {}, 'failed', true);
    const withoutStack = InstrumentationLog.failed(
      operation,
      {},
      'failed',
      false,
    );

    expect(log.toPrimitives().error).toMatchObject({
      message: 'A non-Error value was thrown',
      name: 'NonErrorThrownError',
    });
    expect(log.toPrimitives().error?.stack).toContain(
      'NonErrorThrownError: A non-Error value was thrown',
    );
    expect(withoutStack.toPrimitives().error).toEqual({
      message: 'A non-Error value was thrown',
      name: 'NonErrorThrownError',
    });
  });
});
