import { BoundedInMemoryMetricsAdapter } from '../../src/in-memory/BoundedInMemoryMetricsAdapter.js';
import { MetricMeasurement } from '../../src/metrics/MetricMeasurement.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(BoundedInMemoryMetricsAdapter.name, () => {
  it('records increments and observations', () => {
    const adapter = new BoundedInMemoryMetricsAdapter(2);

    adapter.increment(
      new MetricMeasurement(
        new OperationName('users'),
        'calls',
        'users.calls',
        1,
        { service: 'api' },
      ),
    );
    adapter.observe(
      new MetricMeasurement(
        new OperationName('users'),
        'duration',
        'users.duration',
        4,
        { service: 'api' },
      ),
    );

    expect(adapter.getCapacity()).toBe(2);
    expect(adapter.snapshot()).toEqual([
      expect.objectContaining({
        attributes: { service: 'api' },
        name: 'users.calls',
        type: 'increment',
        value: 1,
      }),
      expect.objectContaining({
        attributes: { service: 'api' },
        name: 'users.duration',
        type: 'observation',
        value: 4,
      }),
    ]);
  });

  it('discards old metrics and clears its state', () => {
    const adapter = new BoundedInMemoryMetricsAdapter(1);
    adapter.increment(
      new MetricMeasurement(
        new OperationName('first'),
        'calls',
        'first',
        1,
        {},
      ),
    );
    adapter.increment(
      new MetricMeasurement(
        new OperationName('second'),
        'calls',
        'second',
        1,
        {},
      ),
    );

    expect(adapter.getDiscarded()).toBe(1);

    adapter.clear();

    expect(adapter.snapshot()).toEqual([]);
    expect(adapter.getDiscarded()).toBe(0);
  });
});
