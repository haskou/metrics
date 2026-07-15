import { configureMetrics } from '../../src/instrumentation/configureMetrics.js';
import { measure } from '../../src/instrumentation/measure.js';
import { InMemoryLoggerAdapter } from '../../src/testing/InMemoryLoggerAdapter.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';

describe(configureMetrics.name, () => {
  it('configures the global runtime and returns its restore function', () => {
    const adapter = new InMemoryMetricsAdapter();
    const restore = configureMetrics({ adapter });

    measure('configured', () => undefined, { recordDuration: false });
    restore();

    expect(adapter.increments[0]!.name).toBe('configured.calls');
  });

  it('applies global instrumentation defaults before operation options', () => {
    const adapter = new InMemoryMetricsAdapter();
    const logger = new InMemoryLoggerAdapter();
    const restore = configureMetrics({
      adapter,
      defaults: {
        logCalls: false,
        logFailures: true,
        recordDuration: false,
      },
      logger,
    });

    try {
      measure('defaults.success', () => undefined);
      expect(() =>
        measure('defaults.failure', () => {
          throw new Error('failed');
        }),
      ).toThrow('failed');
      measure('defaults.override', () => undefined, {
        logCalls: true,
        recordDuration: true,
      });
    } finally {
      restore();
    }

    expect(logger.entries.map((entry) => entry.message)).toEqual([
      'defaults.failure failed',
      'defaults.override called',
    ]);
    expect(adapter.observations.map(({ name }) => name)).toEqual([
      'defaults.override.duration',
    ]);
  });
});
