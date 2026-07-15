import { Counter, Gauge, Histogram } from 'prom-client';

import type { MetricsPort } from '../../contracts/MetricsPort.js';
import type { MetricMeasurement } from '../../metrics/index.js';
import type { PrometheusMetricsAdapterOptions } from './PrometheusMetricsAdapterOptions.js';

import { UnsupportedPrometheusMetricError } from '../../errors/index.js';

const DEFAULT_DURATION_BUCKETS_SECONDS = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
];
const DEFAULT_CPU_BUCKETS_SECONDS = [
  0.000_01, 0.000_05, 0.000_1, 0.000_5, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1,
];

export class PrometheusMetricsAdapter implements MetricsPort {
  private readonly calls: Counter<string>;
  private readonly cpuSystem: Histogram<string>;
  private readonly cpuUser: Histogram<string>;
  private readonly duration: Histogram<string>;
  private readonly failures: Counter<string>;
  private readonly heapUsed: Gauge<string>;
  private readonly heapUsedDelta: Gauge<string>;
  private readonly labelNames: readonly string[];
  private readonly residentSet: Gauge<string>;
  private readonly residentSetDelta: Gauge<string>;

  public constructor(options: PrometheusMetricsAdapterOptions) {
    const prefix = this.normalizePrefix(options.prefix ?? 'haskou_metrics_');
    this.labelNames = Object.freeze([
      'operation',
      ...new Set(
        (options.attributeNames ?? []).filter((name) => name !== 'operation'),
      ),
    ]);
    const metricConfiguration = {
      labelNames: this.labelNames,
      registers: [options.registry],
    };

    this.calls = new Counter({
      ...metricConfiguration,
      help: 'Number of instrumented method calls.',
      name: `${prefix}calls_total`,
    });
    this.failures = new Counter({
      ...metricConfiguration,
      help: 'Number of failed instrumented method calls.',
      name: `${prefix}failures_total`,
    });
    this.duration = new Histogram({
      ...metricConfiguration,
      buckets: [
        ...(options.durationBucketsSeconds ?? DEFAULT_DURATION_BUCKETS_SECONDS),
      ],
      help: 'Instrumented method duration in seconds.',
      name: `${prefix}duration_seconds`,
    });
    this.cpuUser = new Histogram({
      ...metricConfiguration,
      buckets: [...(options.cpuBucketsSeconds ?? DEFAULT_CPU_BUCKETS_SECONDS)],
      help: 'User CPU time consumed during an instrumented method in seconds.',
      name: `${prefix}cpu_user_seconds`,
    });
    this.cpuSystem = new Histogram({
      ...metricConfiguration,
      buckets: [...(options.cpuBucketsSeconds ?? DEFAULT_CPU_BUCKETS_SECONDS)],
      help: 'System CPU time consumed during an instrumented method in seconds.',
      name: `${prefix}cpu_system_seconds`,
    });
    this.residentSet = new Gauge({
      ...metricConfiguration,
      help: 'Process resident set size after an instrumented method in bytes.',
      name: `${prefix}memory_rss_bytes`,
    });
    this.heapUsed = new Gauge({
      ...metricConfiguration,
      help: 'Process heap used after an instrumented method in bytes.',
      name: `${prefix}memory_heap_used_bytes`,
    });
    this.residentSetDelta = new Gauge({
      ...metricConfiguration,
      help: 'Process resident set size change during an instrumented method in bytes.',
      name: `${prefix}memory_rss_delta_bytes`,
    });
    this.heapUsedDelta = new Gauge({
      ...metricConfiguration,
      help: 'Process heap used change during an instrumented method in bytes.',
      name: `${prefix}memory_heap_used_delta_bytes`,
    });
  }

  private normalizePrefix(prefix: string): string {
    const normalized = prefix.replace(/[^a-zA-Z0-9_:]/g, '_');

    if (normalized === '') {
      return '';
    }

    const safeStart = /^[a-zA-Z_:]/.test(normalized)
      ? normalized
      : `_${normalized}`;

    return safeStart.endsWith('_') ? safeStart : `${safeStart}_`;
  }

  private labels(
    measurement: MetricMeasurement,
  ): Record<string, string | number> {
    const { attributes, operation } = measurement.toPrimitives();
    const labels: Record<string, string | number> = { operation };

    for (const name of this.labelNames) {
      if (name === 'operation') {
        continue;
      }

      const value = attributes[name];
      labels[name] = typeof value === 'boolean' ? String(value) : (value ?? '');
    }

    return labels;
  }

  public increment(measurement: MetricMeasurement): void {
    const metric = measurement.toPrimitives();
    const labels = this.labels(measurement);

    if (metric.kind === 'calls') {
      this.calls.inc(labels, metric.value);

      return;
    }

    if (metric.kind === 'failures') {
      this.failures.inc(labels, metric.value);

      return;
    }

    throw new UnsupportedPrometheusMetricError(metric.kind, 'increment');
  }

  public observe(measurement: MetricMeasurement): void {
    const metric = measurement.toPrimitives();
    const labels = this.labels(measurement);

    switch (metric.kind) {
      case 'duration':
        this.duration.observe(labels, metric.value / 1_000);

        return;
      case 'cpu.user':
        this.cpuUser.observe(labels, metric.value / 1_000_000);

        return;
      case 'cpu.system':
        this.cpuSystem.observe(labels, metric.value / 1_000_000);

        return;
      case 'memory.rss':
        this.residentSet.set(labels, metric.value);

        return;
      case 'memory.heap_used':
        this.heapUsed.set(labels, metric.value);

        return;
      case 'memory.rss_delta':
        this.residentSetDelta.set(labels, metric.value);

        return;
      case 'memory.heap_used_delta':
        this.heapUsedDelta.set(labels, metric.value);

        return;
      default:
        throw new UnsupportedPrometheusMetricError(metric.kind, 'observe');
    }
  }
}
