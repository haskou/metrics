# Ports and telemetry records

All ports return synchronously. An adapter may buffer or batch work internally,
but instrumentation does not await network or storage I/O.

## Metrics

```typescript
interface MetricsPort {
  increment(measurement: MetricMeasurement): void;
  observe(measurement: MetricMeasurement): void;
}
```

`MetricMeasurement.toPrimitives()` returns:

```typescript
interface MetricMeasurementPrimitives {
  attributes: Readonly<Record<string, string | number | boolean>>;
  kind: MetricKind;
  name: string;
  operation: string;
  unit: MetricUnit;
  value: number;
}
```

| Kind                     | Port method | Unit           |
| ------------------------ | ----------- | -------------- |
| `calls`                  | `increment` | `count`        |
| `failures`               | `increment` | `count`        |
| `duration`               | `observe`   | `milliseconds` |
| `cpu.user`               | `observe`   | `microseconds` |
| `cpu.system`             | `observe`   | `microseconds` |
| `memory.rss`             | `observe`   | `bytes`        |
| `memory.heap_used`       | `observe`   | `bytes`        |
| `memory.rss_delta`       | `observe`   | `bytes`        |
| `memory.heap_used_delta` | `observe`   | `bytes`        |

Adapters should choose the vendor instrument from `kind` and convert values
from `unit` when the backend expects base units. `name` contains the configured
generic metric name; `operation` contains the logical operation label.

## Structured logs

```typescript
interface LoggerPort {
  write(entry: InstrumentationLog): void;
}
```

`InstrumentationLog.toPrimitives()` returns:

```typescript
interface InstrumentationLogPrimitives {
  attributes: Readonly<Record<string, string | number | boolean>>;
  level: 'called' | 'failed';
  message: string;
  operation: string;
  stackTrace?: string;
}
```

`called` is a lifecycle value, not a logging severity. Logging adapters choose
their vendor severity. The built-in console adapter uses `log` for calls and
`error` for failures. Instrumentation never includes arguments or return
values.

## Clock and resource usage

```typescript
interface ClockPort {
  now(): ElapsedMilliseconds;
}

interface ResourceUsagePort {
  capture(): ResourceUsageSnapshot;
}
```

`ResourceUsageSnapshot` contains user and system CPU microseconds, resident set
bytes, and heap-used bytes. CPU and memory describe the whole Node.js process;
concurrent work and garbage collection affect per-operation deltas.

## Default inspection snapshot

```typescript
interface MetricsInspectionSnapshot {
  capacity: { logs: number; metrics: number };
  discarded: { logs: number; metrics: number };
  logs: readonly InMemoryLogRecord[];
  metrics: readonly InMemoryMetricRecord[];
}
```

Metric records add `recordedAt` and `type` to
`MetricMeasurementPrimitives`. Log records add `recordedAt` to
`InstrumentationLogPrimitives`. Timestamps use Unix milliseconds.

## Public errors

| Error                                | Meaning                                        |
| ------------------------------------ | ---------------------------------------------- |
| `InvalidOperationNameError`          | An explicit operation name is empty            |
| `InvalidMetricsDecoratorTargetError` | `@Metrics` was applied to a non-method         |
| `InvalidBufferCapacityError`         | An in-memory capacity is not a positive int    |
| `NonErrorThrownError`                | A non-`Error` throw needed a fallback stack    |
| `UnsupportedPrometheusMetricError`   | A metric kind reached the wrong adapter method |

Instrumentation contains errors raised by ports. Constructor and decorator
validation errors still reach the caller.

## Package entrypoints

| Entrypoint                            | Contents                             |
| ------------------------------------- | ------------------------------------ |
| `@haskou/metrics`                     | Core API, ports, records, and values |
| `@haskou/metrics/testing`             | In-memory, manual, and no-op doubles |
| `@haskou/metrics/adapters/console`    | Console structured logger            |
| `@haskou/metrics/adapters/node`       | Node.js CPU and memory sampling      |
| `@haskou/metrics/adapters/prometheus` | `prom-client` metrics adapter        |
