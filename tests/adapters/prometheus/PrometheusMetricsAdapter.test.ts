import { Registry } from 'prom-client';

import { PrometheusMetricsAdapter } from '../../../src/adapters/prometheus/PrometheusMetricsAdapter.js';
import { UnsupportedPrometheusMetricError } from '../../../src/errors/UnsupportedPrometheusMetricError.js';
import { MetricMeasurement } from '../../../src/metrics/MetricMeasurement.js';
import { OperationName } from '../../../src/values/OperationName.js';

describe(PrometheusMetricsAdapter.name, () => {
  const measurement = (
    kind: ConstructorParameters<typeof MetricMeasurement>[1],
    value: number,
  ): MetricMeasurement =>
    new MetricMeasurement(
      new OperationName('users.create'),
      kind,
      `users.create.${kind}`,
      value,
      { cold: true, ignored: 'value', service: 'api' },
    );

  it('maps every metric kind to valid Prometheus instruments and units', async () => {
    const registry = new Registry();
    const adapter = new PrometheusMetricsAdapter({
      attributeNames: ['service', 'cold', 'missing', 'operation', 'service'],
      cpuBucketsSeconds: [0.001, 0.01],
      durationBucketsSeconds: [0.5, 1],
      prefix: '9 custom.prefix',
      registry,
    });

    adapter.increment(measurement('calls', 1));
    adapter.increment(measurement('failures', 1));
    adapter.observe(measurement('duration', 1_000));
    adapter.observe(measurement('cpu.user', 1_000));
    adapter.observe(measurement('cpu.system', 2_000));
    adapter.observe(measurement('memory.rss', 100));
    adapter.observe(measurement('memory.heap_used', 80));
    adapter.observe(measurement('memory.rss_delta', -10));
    adapter.observe(measurement('memory.heap_used_delta', 5));

    const output = await registry.metrics();

    expect(output).toContain('_9_custom_prefix_calls_total');
    expect(output).toContain('_9_custom_prefix_failures_total');
    expect(output).toContain('_9_custom_prefix_duration_seconds');
    expect(output).toContain('_9_custom_prefix_cpu_user_seconds');
    expect(output).toContain('_9_custom_prefix_cpu_system_seconds');
    expect(output).toContain('_9_custom_prefix_memory_rss_bytes');
    expect(output).toContain('_9_custom_prefix_memory_heap_used_bytes');
    expect(output).toContain('_9_custom_prefix_memory_rss_delta_bytes');
    expect(output).toContain('_9_custom_prefix_memory_heap_used_delta_bytes');
    expect(output).toContain(
      'operation="users.create",service="api",cold="true",missing=""',
    );
    expect(output).not.toContain('ignored="value"');
    expect(output).toContain('_duration_seconds_sum{');
    expect(output).toContain('missing=""} 1');
    expect(output).toContain('_cpu_user_seconds_sum{');
    expect(output).toContain('missing=""} 0.001');
    expect(output).toContain('_cpu_system_seconds_sum{');
    expect(output).toContain('missing=""} 0.002');
  });

  it('supports default, empty, and delimiter-free prefixes', () => {
    const defaults = new Registry();
    const empty = new Registry();
    const delimiterFree = new Registry();

    new PrometheusMetricsAdapter({ registry: defaults });
    new PrometheusMetricsAdapter({ prefix: '', registry: empty });
    new PrometheusMetricsAdapter({
      prefix: 'metrics',
      registry: delimiterFree,
    });

    expect(
      defaults.getSingleMetric('haskou_metrics_calls_total'),
    ).toBeDefined();
    expect(empty.getSingleMetric('calls_total')).toBeDefined();
    expect(delimiterFree.getSingleMetric('metrics_calls_total')).toBeDefined();
  });

  it('rejects metric kinds sent through the wrong operation', () => {
    const adapter = new PrometheusMetricsAdapter({ registry: new Registry() });

    expect(() => adapter.increment(measurement('duration', 1))).toThrow(
      UnsupportedPrometheusMetricError,
    );
    expect(() => adapter.observe(measurement('calls', 1))).toThrow(
      UnsupportedPrometheusMetricError,
    );
  });
});
