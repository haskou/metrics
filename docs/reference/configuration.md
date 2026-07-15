# Configuration and naming

## Default runtime

You can use `@Metrics`, `measure`, and `instrumentFunction` without calling
`configureMetrics`. The default runtime stores the latest 1,000 metric records
and 1,000 log records in separate bounded buffers.

```typescript
import { metrics } from '@haskou/metrics';

const snapshot = metrics.snapshot();
console.table(snapshot.metrics);
console.table(snapshot.logs);

metrics.clear();
```

Each buffer replaces its oldest record when full and increments its own
`discarded` count. `metrics.snapshot()` only inspects these default buffers. If
you configure an external adapter, inspect that backend instead.

## Process-wide configuration

`configureMetrics` replaces the process-wide instrumenter and returns an
idempotent restore function:

```typescript
const restore = configureMetrics({ adapter, logger });

// Instrumented work uses adapter and logger.

restore();
```

Call it from the composition root before instrumented work starts. For isolated
components or concurrent configurations, construct `MetricsInstrumenter`
directly and inject it instead of changing process-wide state.

### `MetricsConfiguration`

| Property                 | Type                          | Default                        |
| ------------------------ | ----------------------------- | ------------------------------ |
| `adapter`                | `MetricsPort`                 | Required                       |
| `attributes`             | `MetricAttributes`            | `{}`                           |
| `clock`                  | `ClockPort`                   | Monotonic system clock         |
| `logger`                 | `LoggerPort`                  | No-op after explicit configure |
| `nameFormatter`          | `(operation, kind) => string` | `operation.kind`               |
| `onInstrumentationError` | `(error: unknown) => void`    | No callback                    |
| `prefix`                 | `string`                      | No prefix                      |
| `resourceUsage`          | `ResourceUsagePort`           | Node.js process resource usage |

Shared attributes merge with method-level attributes. Method-level values win
when both objects contain the same key.

Instrumentation catches errors from ports, clocks, resource sampling, and
`onInstrumentationError`. Telemetry failures do not change the return value or
error behavior of the instrumented operation.

## Instrumentation options

`Metrics`, `measure`, and `instrumentFunction` accept `InstrumentationOptions`:

| Option              | Default | Effect                                       |
| ------------------- | ------- | -------------------------------------------- |
| `attributes`        | `{}`    | Adds attributes to this operation            |
| `recordCalls`       | `true`  | Increments the call counter                  |
| `recordDuration`    | `true`  | Observes elapsed milliseconds                |
| `recordFailures`    | `true`  | Increments the failure counter               |
| `logCalls`          | `true`  | Writes a structured call log                 |
| `logFailures`       | `true`  | Writes a structured failure log              |
| `captureStackTrace` | `true`  | Adds a stack trace to failure logs           |
| `recordCpu`         | `false` | Observes process CPU deltas                  |
| `recordMemory`      | `false` | Observes process RSS, heap, and their deltas |

Log switches still write nothing when the configured logger is a no-op.

## Decorator names

`@Metrics()` infers `ClassName.methodName`:

```typescript
class UserCreator {
  @Metrics()
  public create(): void {}
}
```

The operation name is `UserCreator.create`. Pass `undefined` to combine
inference with options:

```typescript
@Metrics(undefined, { recordCpu: true })
```

Use an explicit name for dashboards, alerts, and recording rules that must
survive refactors or minification:

```typescript
@Metrics('users.create')
```

### Standard and legacy behavior

- Standard decorators resolve the class from the method receiver when the
  method runs. Calling an inherited method on a subclass uses the subclass
  name.
- Legacy decorators resolve the declaring class when TypeScript applies the
  decorator. An inherited method keeps the declaring class name.
- Static methods resolve the constructor name in both modes.
- A standard-decorated method called without a receiver falls back to
  `Anonymous.methodName`.
- Bundlers, minifiers, and class renames can change inferred names.

Explicit operation names avoid these differences.

## Function instrumentation

Functions have no reliable class name, so `measure` and `instrumentFunction`
require an explicit operation name:

```typescript
const result = await measure('users.create', () => creator.create(command));
const measuredCreate = instrumentFunction('users.create', createUser);
```
