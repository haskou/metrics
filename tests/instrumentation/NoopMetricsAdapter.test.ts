import { NoopMetricsAdapter } from '../../src/instrumentation/NoopMetricsAdapter.js';
import { MetricMeasurement } from '../../src/metrics/MetricMeasurement.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(NoopMetricsAdapter.name, () => {
  it('ignores increments and observations', () => {
    const adapter = new NoopMetricsAdapter();
    const operation = new OperationName('users.create');

    expect(() => {
      adapter.increment(
        new MetricMeasurement(operation, 'calls', 'calls', 1, {}),
      );
      adapter.observe(
        new MetricMeasurement(operation, 'duration', 'duration', 2, {}),
      );
    }).not.toThrow();
  });
});
