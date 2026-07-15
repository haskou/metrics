# Public API

This page lists the consumer-facing entrypoints. See
[configuration and naming](/reference/configuration) for defaults and
[ports and telemetry records](/reference/contracts) for exact boundary shapes.

## Instrumentation

### `Metrics(name?, options?)`

Standard and legacy TypeScript method decorator. It preserves `this`,
arguments, return values, thrown errors, and rejected promises.

Without a name, it uses `ClassName.methodName`. An explicit name overrides the
inferred value. Use `Metrics(undefined, options)` to infer the name while
setting instrumentation options.

### `measure(name, operation, options?)`

Runs and instruments one synchronous or asynchronous callback.

### `instrumentFunction(name, operation, options?)`

Creates an instrumented function while preserving its TypeScript signature and
`this` binding.

### `configureMetrics(configuration)`

Configures the process-wide runtime and returns an idempotent restore function.
Configuration supports metrics, logger, clock, and resource-usage ports plus a
prefix, shared attributes, custom name formatter, and instrumentation error
callback. `NodeResourceUsageAdapter` is used when no resource port is supplied.

### `MetricsInstrumenter`

Injectable class containing the instrumentation behavior. It provides
`measure` and `instrument` methods without relying on process-wide state.

### `resetMetrics()`

Creates a fresh default in-memory runtime. It is mainly useful for isolated
tests.

### `metrics`

The default inspector exposes `snapshot()` and `clear()`. A snapshot contains
bounded metric and log records, buffer capacities, and discarded-entry counts.
Each default buffer retains 1,000 entries.

## Options

`InstrumentationOptions` supports static `attributes` and these switches:

- `recordCalls`, `recordDuration`, and `recordFailures` default to enabled.
- `logCalls` and `logFailures` default to enabled when a logger is configured.
- `captureStackTrace` defaults to enabled for failure logs.
- `recordCpu` and `recordMemory` are opt-in.

`MetricAttributes` accepts only strings, numbers, and booleans at the type
boundary. Choose bounded-cardinality values suitable for the target backend.

See the complete option and configuration tables in
[configuration and naming](/reference/configuration).

## Public contract types

| Type                             | Role                                        |
| -------------------------------- | ------------------------------------------- |
| `MetricsConfiguration`           | Process-wide or injected configuration      |
| `InstrumentationOptions`         | Per-operation signal switches               |
| `MetricAttributes`               | String, number, or boolean attributes       |
| `MetricKind`                     | Closed set of emitted metric kinds          |
| `MetricUnit`                     | Count, bytes, milliseconds, or microseconds |
| `MetricMeasurementPrimitives`    | Serialized metric adapter input             |
| `InstrumentationLogPrimitives`   | Serialized structured log                   |
| `ResourceUsagePrimitives`        | Serialized CPU and memory snapshot          |
| `MetricsInspectionSnapshot`      | Default in-memory inspector result          |
| `MetricsMethodDecorator`         | Standard and legacy decorator contract      |
| `LegacyMetricsMethodDecorator`   | Legacy decorator contract                   |
| `StandardMetricsMethodDecorator` | Standard decorator contract                 |

`ClockPort`, `LoggerPort`, `MetricsPort`, and `ResourceUsagePort` define the
outbound boundaries. Their exact methods and record shapes live in
[ports and telemetry records](/reference/contracts).

## Telemetry objects

- `MetricMeasurement` carries one metric and serializes through
  `toPrimitives()`.
- `InstrumentationLog` carries a call or failure log, exposes `isFailure()`,
  and serializes through `toPrimitives()`.
- `InstrumentationLogLevel` models the `called` and `failed` lifecycle values.
- `ResourceUsageSnapshot` calculates CPU and memory values since an earlier
  snapshot.

## Value Objects

The public technical Value Objects include `BufferCapacity`, `OperationName`,
`ElapsedMilliseconds`, `CpuMicroseconds`, `MemoryBytes`, `MemoryByteDelta`, and
`StackTrace`. `MetricUnit` is a unit type, while metric and resource snapshots
are immutable boundary objects. Adapters serialize these objects at output
boundaries.

The [contracts reference](/reference/contracts) also lists the public error
classes and when consumers can receive them.

## Dedicated entrypoints

- `@haskou/metrics/testing`
- `@haskou/metrics/adapters/console`
- `@haskou/metrics/adapters/node`
- `@haskou/metrics/adapters/prometheus`

The [contracts reference](/reference/contracts) lists their exported roles.
