import { InvalidMetricsDecoratorTargetError } from '../../src/errors/InvalidMetricsDecoratorTargetError.js';

describe(InvalidMetricsDecoratorTargetError.name, () => {
  it('provides a stable error name and message', () => {
    const error = new InvalidMetricsDecoratorTargetError();

    expect(error).toBeInstanceOf(TypeError);
    expect(error.name).toBe('InvalidMetricsDecoratorTargetError');
    expect(error.message).toBe('Metrics can only decorate methods');
  });
});
