# @haskou/metrics

> Framework-agnostic instrumentation for TypeScript.

Measure calls, failures, execution time, CPU and memory usage, and emit structured logs without coupling your application to an observability vendor.

[![CI](https://github.com/haskou/metrics/actions/workflows/ci.yml/badge.svg)](https://github.com/haskou/metrics/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/haskou/metrics/graph/badge.svg)](https://codecov.io/gh/haskou/metrics)
[![npm](https://img.shields.io/npm/v/@haskou/metrics.svg)](https://www.npmjs.com/package/@haskou/metrics)
[![npm downloads](https://img.shields.io/npm/dw/@haskou/metrics.svg)](https://www.npmjs.com/package/@haskou/metrics)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE.txt)

[Documentation](https://haskou.github.io/metrics/) ·
[Live playground](https://haskou.github.io/metrics/playground/) ·
[StackBlitz](https://stackblitz.com/github/haskou/metrics?startScript=playground:dev)

## Installation

```bash
npm install @haskou/metrics
```

```bash
yarn add @haskou/metrics
```

## Runtime compatibility

The core requires ES2022 and `performance.now()` (or a supplied `ClockPort`).
The package does not declare a Node.js version range; this does not promise
support for every historical Node.js release. The package includes ESM and CommonJS builds with
matching TypeScript declarations. Node imports and requires share configuration
and in-memory buffers, including imports through public subpaths.

Browser bundlers use the native ESM build. Compatibility checks cover Node.js
22, 24 and 26 and a browser bundle executed without Node globals. Other runtimes
are not yet part of the verified compatibility matrix.

CPU and memory sampling are selected automatically in Node.js when enabled.
Browsers omit those measurements. A custom `resourceUsage` adapter remains an
advanced option. The Prometheus integration is Node-specific.
Building and testing this repository uses Node.js 24.18.0; that tooling
requirement does not apply to applications consuming the package.

## Why?

Application instrumentation tends to leak infrastructure concerns everywhere.

```typescript
const start = performance.now();

try {
  const user = await createUser(command);

  metricsCounter.inc();
  durationHistogram.observe(performance.now() - start);

  return user;
} catch (error) {
  failureCounter.inc();
  logger.error(error);

  throw error;
}
```

That code now knows about metrics, timing, logging and whatever observability vendor happens to be in use.

With `@haskou/metrics`, the operation stays an operation:

```typescript
import { measure } from "@haskou/metrics";

const user = await measure("users.create", () => createUser(command));
```

By default this records calls, failures, duration and structured logs.

The instrumentation backend can change without changing the instrumented code.

## Zero setup

No configuration is required to start using it.

The default runtime keeps the latest 1,000 metrics and 1,000 logs in separate
bounded in-memory buffers. When full, each buffer replaces its oldest record and
increments its `discarded` counter, available through `metrics.snapshot()`:

```typescript
import { measure, metrics } from "@haskou/metrics";

await measure("users.create", () => createUser(command));

console.table(metrics.snapshot().metrics);
console.table(metrics.snapshot().logs);
```

Clear the in-memory data when needed:

```typescript
metrics.clear();
```

This makes it useful immediately during development, debugging and tests without requiring Prometheus, Grafana or any external service.

## Instrument any operation

### Functions

Use `measure` when instrumenting a specific operation:

```typescript
const result = await measure("payments.process", () => processPayment(payment));
```

It works with both synchronous and asynchronous operations.

### Reusable functions

Use `instrumentFunction` when the function itself should remain instrumented:

```typescript
import { instrumentFunction } from "@haskou/metrics";

const measuredCreateUser = instrumentFunction("users.create", createUser);

await measuredCreateUser(command);
```

### Methods

Use the `@Metrics` decorator when working with classes:

```typescript
import { Metrics } from "@haskou/metrics";

class UserCreator {
  @Metrics("users.create")
  public async create(): Promise<void> {
    // ...
  }
}
```

The name can also be inferred automatically:

```typescript
class UserCreator {
  @Metrics()
  public async create(): Promise<void> {
    // ...
  }
}
```

This operation is recorded as:

```text
UserCreator.create
```

Explicit names are recommended for dashboards and alerts that should remain stable after refactors.

## What it captures

| Signal               | Default |
| -------------------- | :-----: |
| Calls                |   On    |
| Failures             |   On    |
| Execution duration   |   On    |
| Structured call logs |   On    |
| Failure logs         |   On    |
| Stack traces         |   On    |
| CPU time             | Opt-in  |
| RSS and heap usage   | Opt-in  |
| Memory deltas        | Opt-in  |

Enable resource sampling only where you need it. In Node.js, no adapter
configuration is required; browsers omit CPU and memory measurements.

```typescript
await measure("reports.generate", () => generateReport(), {
  recordCpu: true,
  recordMemory: true,
});
```

The same options work with decorators:

```typescript
class ReportGenerator {
  @Metrics("reports.generate", {
    recordCpu: true,
    recordMemory: true,
  })
  public async generate(): Promise<void> {
    // ...
  }
}
```

CPU and memory values describe the Node.js process, so concurrent work and garbage collection can affect the measurements.

## Production backends

Instrumentation is independent from the destination that receives the metrics.

Configure infrastructure once at your application's composition root:

```typescript
import { Registry } from "prom-client";

import { configureMetrics } from "@haskou/metrics";
import { ConsoleLoggerAdapter } from "@haskou/metrics/adapters/console";
import { PrometheusMetricsAdapter } from "@haskou/metrics/adapters/prometheus";

const registry = new Registry();

configureMetrics({
  adapter: new PrometheusMetricsAdapter({
    registry,
    attributeNames: ["service", "environment"],
  }),

  attributes: {
    service: "users-api",
    environment: "production",
  },

  logger: new ConsoleLoggerAdapter(),

  defaults: {
    logCalls: false,
    logFailures: true,
    recordDuration: true,
  },
});
```

Install `prom-client` only when using the Prometheus adapter:

```bash
npm install prom-client
```

Your application code remains unchanged:

```typescript
await measure("users.create", () => createUser(command));
```

Development can use the built-in in-memory runtime.

Production can send the same instrumentation to Prometheus and structured log infrastructure.

The operation itself does not need to know.

## Keep infrastructure outside your application

The library separates instrumentation from its output through ports.

This allows metrics and logs to be mapped to different observability stacks without spreading vendor SDKs through application code.

Typical destinations include:

| Destination          | Mapping                            |
| -------------------- | ---------------------------------- |
| Prometheus / Grafana | Counters, histograms and gauges    |
| OpenTelemetry        | Matching metric instruments        |
| StatsD / Datadog     | Measurements mapped to vendor APIs |
| Loki                 | Structured logs                    |
| Pino                 | Structured logs                    |
| Winston              | Structured logs                    |
| OpenTelemetry Logs   | Structured logs                    |

Adapters can be implemented against the library contracts when a destination is not provided directly.

## Prometheus cardinality

Keep metric attributes low-cardinality and bounded.

Good:

```text
service
environment
route
method
status
```

Avoid:

```text
userId
requestId
email
full URL
error message
stack trace
```

Unbounded labels can create enormous Prometheus cardinality and turn a perfectly innocent dashboard into infrastructure arson.

## Structured failures

Failed operations are recorded without changing their normal error behaviour:

```typescript
await measure("payments.process", () => processPayment(payment));
```

If `processPayment` throws, instrumentation can record:

- the failed operation
- execution duration
- structured failure information
- stack trace

The original error still propagates to the caller.

Observability should observe your application, not rewrite its control flow.

## Documentation

Full documentation:

https://haskou.github.io/metrics/

Integration guides:

- [Prometheus and Grafana](https://github.com/haskou/metrics/blob/main/docs/integrations/prometheus.md)
- [Winston](https://github.com/haskou/metrics/blob/main/docs/integrations/winston.md)
- [Adapters](https://github.com/haskou/metrics/blob/main/docs/reference/adapters.md)
- [Configuration](https://github.com/haskou/metrics/blob/main/docs/reference/configuration.md)

## Try it online

The playground lets you run successful and failed operations and inspect the generated metrics, logs and stack traces directly in the browser:

https://haskou.github.io/metrics/playground/

Or edit the example in StackBlitz:

https://stackblitz.com/github/haskou/metrics?startScript=playground:dev

## Development

```bash
git clone https://github.com/haskou/metrics.git
cd metrics

yarn install
yarn test
yarn build
```

## License

MIT. See [LICENSE.txt](LICENSE.txt).
