import { configureMetrics, measure, metrics } from '@haskou/metrics';
import { metrics as inspector } from '@haskou/metrics/instrumentation';
import { InMemoryMetricsAdapter } from '@haskou/metrics/testing';

export async function verify(): Promise<void> {
  metrics.clear();
  const result = await measure('browser.success', () => Promise.resolve(42), {
    recordCpu: true,
    recordMemory: true,
  });

  if (result !== 42 || inspector.snapshot().metrics.length !== 2) {
    throw new Error(
      'Browser entrypoints must share their runtime without resource sampling',
    );
  }
  const original = new Error('operation failed');
  try {
    await measure('browser.failure', () => Promise.reject(original));
    throw new Error('Expected rejection');
  } catch (error) {
    if (error !== original) throw error;
  }

  if (!metrics.snapshot().logs.some((log) => log.level === 'failed')) {
    throw new Error('Browser failures must be logged');
  }
  const adapter = new InMemoryMetricsAdapter();
  const restore = configureMetrics({ adapter });
  measure('browser.configured', () => 1, { recordDuration: false });
  restore();

  if (adapter.increments[0]?.name !== 'browser.configured.calls') {
    throw new Error(
      'Browser configuration must reach the instrumented operation',
    );
  }
}
