import { configureMetrics } from '../../src/instrumentation/configureMetrics.js';
import {
  instrumentFunction,
  measure,
} from '../../src/instrumentation/measure.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';

describe(measure.name, () => {
  it('measures operations through the global runtime', () => {
    const adapter = new InMemoryMetricsAdapter();
    configureMetrics({ adapter });

    expect(
      measure('users.create', () => 'created', { recordDuration: false }),
    ).toBe('created');
    expect(adapter.increments[0]!.name).toBe('users.create.calls');
  });
});

describe(instrumentFunction.name, () => {
  it('creates globally instrumented functions', () => {
    const adapter = new InMemoryMetricsAdapter();
    configureMetrics({ adapter });
    const operation = instrumentFunction(
      'numbers.double',
      (value: number) => value * 2,
      { recordDuration: false },
    );

    expect(operation(3)).toBe(6);
    expect(adapter.increments[0]!.name).toBe('numbers.double.calls');
  });
});
