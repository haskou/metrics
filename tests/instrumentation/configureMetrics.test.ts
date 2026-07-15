import { configureMetrics } from '../../src/instrumentation/configureMetrics.js';
import { measure } from '../../src/instrumentation/measure.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';

describe(configureMetrics.name, () => {
  it('configures the global runtime and returns its restore function', () => {
    const adapter = new InMemoryMetricsAdapter();
    const restore = configureMetrics({ adapter });

    measure('configured', () => undefined, { recordDuration: false });
    restore();

    expect(adapter.increments[0]!.name).toBe('configured.calls');
  });
});
