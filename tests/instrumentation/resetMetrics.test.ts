import { MetricsRuntime } from '../../src/instrumentation/MetricsRuntime.js';
import { resetMetrics } from '../../src/instrumentation/resetMetrics.js';

describe(resetMetrics.name, () => {
  it('restores the bounded default runtime', () => {
    MetricsRuntime.current().measure('before.reset', () => undefined);

    resetMetrics();

    expect(MetricsRuntime.snapshot().metrics).toEqual([]);
    expect(MetricsRuntime.snapshot().logs).toEqual([]);
  });
});
