import { MetricsInspector } from '../../src/instrumentation/MetricsInspector.js';
import { metrics } from '../../src/instrumentation/metricsInstance.js';
import { MetricsRuntime } from '../../src/instrumentation/MetricsRuntime.js';

describe(MetricsInspector.name, () => {
  it('inspects and clears the default runtime', () => {
    MetricsRuntime.reset();
    MetricsRuntime.current().measure('inspected', () => undefined);
    const inspector = new MetricsInspector();

    expect(inspector.snapshot().metrics[0]!.name).toBe('inspected.calls');
    expect(metrics).toBeInstanceOf(MetricsInspector);

    inspector.clear();

    expect(inspector.snapshot().metrics).toEqual([]);
  });
});
