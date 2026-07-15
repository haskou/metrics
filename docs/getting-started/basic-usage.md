# Basic usage

## Configure an adapter

Configuration belongs at the application composition root:

```typescript
import { Registry } from 'prom-client';
import { configureMetrics } from '@haskou/metrics';
import { ConsoleLoggerAdapter } from '@haskou/metrics/adapters/console';
import { PrometheusMetricsAdapter } from '@haskou/metrics/adapters/prometheus';

const registry = new Registry();

configureMetrics({
  adapter: new PrometheusMetricsAdapter({
    attributeNames: ['service'],
    registry,
  }),
  logger: new ConsoleLoggerAdapter(),
  attributes: { service: 'users-api' },
  onInstrumentationError: reportInstrumentationFailure,
});
```

Without configuration, instrumentation stores the latest 1,000 metrics and
1,000 logs in memory. Inspect or clear them through `metrics`:

```typescript
import { metrics } from '@haskou/metrics';

console.table(metrics.snapshot().metrics);
metrics.clear();
```

## Decorate a method

Let the decorator derive `ClassName.methodName`:

```typescript
import { Metrics } from '@haskou/metrics';

class UserCreator {
  @Metrics()
  public async create(command: CreateUser): Promise<User> {
    return this.users.create(command);
  }
}
```

Pass an explicit name when dashboards and alerts must survive class renames or
code minification:

```typescript
import { Metrics } from '@haskou/metrics';

class UserCreator {
  @Metrics('users.create', {
    attributes: { source: 'command' },
    recordCpu: true,
    recordMemory: true,
  })
  public async create(command: CreateUser): Promise<User> {
    return this.users.create(command);
  }
}
```

To infer the name while setting options, pass `undefined` as the first
argument:

```typescript
@Metrics(undefined, { recordCpu: true, recordMemory: true })
```

The arguments and result are never inspected. A configured logger receives a
call message and, on failure, a stack trace unless `captureStackTrace` is false.

## Instrument a callback

```typescript
import { measure } from '@haskou/metrics';

const result = await measure('users.create', () => creator.create(command));
```

Use `instrumentFunction` when a reusable wrapped function is more convenient:

```typescript
const measuredCreate = instrumentFunction('users.create', createUser);
```

## Select signals

Call counts, duration, failures, call logs, and failure logs are enabled by
default. CPU and memory sampling are opt-in because they add overhead and
measure the whole Node.js process:

```typescript
measure('cache.read', readCache, {
  recordCalls: true,
  recordCpu: true,
  recordDuration: true,
  recordFailures: false,
  recordMemory: true,
  logCalls: true,
  logFailures: true,
  captureStackTrace: true,
});
```

CPU values are deltas in microseconds. Memory observations contain final RSS
and heap-used bytes plus signed deltas. Concurrent work and garbage collection
can affect these process-level measurements.

See [configuration and naming](/reference/configuration) for every option and
the differences between standard and legacy decorator name inference.
