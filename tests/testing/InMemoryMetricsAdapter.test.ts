import { MetricMeasurement } from '../../src/metrics/MetricMeasurement.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(InMemoryMetricsAdapter.name, () => {
  it('records and clears metrics', () => {
    const adapter = new InMemoryMetricsAdapter();
    const operation = new OperationName('users.create');
    adapter.increment(
      new MetricMeasurement(operation, 'calls', 'calls', 1, {
        service: 'api',
      }),
    );
    adapter.observe(
      new MetricMeasurement(operation, 'duration', 'duration', 4, {
        service: 'api',
      }),
    );

    expect(adapter.increments).toEqual([
      {
        attributes: { service: 'api' },
        kind: 'calls',
        name: 'calls',
        operation: 'users.create',
        unit: 'count',
        value: 1,
      },
    ]);
    expect(adapter.observations).toEqual([
      {
        attributes: { service: 'api' },
        kind: 'duration',
        name: 'duration',
        operation: 'users.create',
        unit: 'milliseconds',
        value: 4,
      },
    ]);

    adapter.clear();

    expect(adapter.increments).toEqual([]);
    expect(adapter.observations).toEqual([]);
  });
});
