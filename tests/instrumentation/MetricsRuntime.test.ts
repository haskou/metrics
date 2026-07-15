import { MetricsRuntime } from '../../src/instrumentation/MetricsRuntime.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';

describe(MetricsRuntime.name, () => {
  it('records with the bounded default runtime', () => {
    MetricsRuntime.reset();

    expect(MetricsRuntime.current().measure('default', () => 1)).toBe(1);
    expect(MetricsRuntime.snapshot().metrics[0]!.name).toBe('default.calls');
  });

  it('configures and restores an instrumenter once', () => {
    const adapter = new InMemoryMetricsAdapter();
    const restore = MetricsRuntime.configure({ adapter });

    MetricsRuntime.current().measure('configured', () => undefined, {
      recordDuration: false,
    });
    restore();
    restore();

    expect(adapter.increments[0]!.name).toBe('configured.calls');
    expect(MetricsRuntime.current().measure('restored', () => 2)).toBe(2);
  });

  it('ignores restores superseded by newer configuration', () => {
    const first = new InMemoryMetricsAdapter();
    const second = new InMemoryMetricsAdapter();
    const restoreFirst = MetricsRuntime.configure({ adapter: first });
    const restoreSecond = MetricsRuntime.configure({ adapter: second });

    restoreFirst();
    MetricsRuntime.current().measure('second', () => undefined, {
      recordDuration: false,
    });
    restoreSecond();

    expect(second.increments[0]!.name).toBe('second.calls');
    expect(first.increments).toEqual([]);
  });

  it('clears the default buffers', () => {
    MetricsRuntime.reset();
    MetricsRuntime.current().measure('default', () => undefined);

    MetricsRuntime.clear();

    expect(MetricsRuntime.snapshot()).toMatchObject({
      capacity: { logs: 1_000, metrics: 1_000 },
      discarded: { logs: 0, metrics: 0 },
      logs: [],
      metrics: [],
    });
  });
});
