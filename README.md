# @haskou/metrics

[![CI](https://github.com/haskou/metrics/actions/workflows/ci.yml/badge.svg)](https://github.com/haskou/metrics/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/haskou/metrics/graph/badge.svg)](https://codecov.io/gh/haskou/metrics)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![npm](https://img.shields.io/npm/v/@haskou/metrics.svg)](https://www.npmjs.com/package/@haskou/metrics)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE.txt)

Metrics and structured logs for TypeScript methods.

[Live playground](https://haskou.github.io/metrics/playground/) ·
[Open in StackBlitz](https://stackblitz.com/github/haskou/metrics?startScript=playground:dev)

```typescript
import { Metrics, metrics } from '@haskou/metrics';

class UserCreator {
  @Metrics()
  public async create(): Promise<void> {
    // your code
  }
}

await new UserCreator().create();

console.table(metrics.snapshot().metrics);
console.table(metrics.snapshot().logs);
```

Without a name, the decorator records this method as `UserCreator.create`. Pass
an explicit name such as `@Metrics('users.create')` when you want a stable name
that does not depend on the class.

Use it without setup. The default runtime stores the latest 1,000 metrics and
1,000 logs in memory. Once a buffer fills, it replaces the oldest entry and
increments the snapshot's `discarded` counter.

```typescript
metrics.clear();
```

## What it captures

| Signal                             | Default |
| ---------------------------------- | ------- |
| Calls, failures, and duration      | On      |
| `UserCreator.create called`        | On      |
| Failure logs with stack traces     | On      |
| CPU time in microseconds           | Opt-in  |
| RSS, heap usage, and memory deltas | Opt-in  |

Enable Node.js resource sampling on the methods that need it:

```typescript
class ReportGenerator {
  @Metrics('reports.generate', {
    recordCpu: true,
    recordMemory: true,
  })
  public async generate(): Promise<void> {
    // ...
  }
}
```

CPU and memory samples describe the Node.js process. Concurrent work can affect
the values, and garbage collection can produce negative memory deltas.

## Connect your stack

Use the in-memory runtime during development. Connect production backends at
your composition root:

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
  attributes: { service: 'users-api' },
  logger: new ConsoleLoggerAdapter(),
});
```

Install `prom-client` only when using this adapter:

```bash
npm install prom-client
```

The ports map directly to the APIs used by common observability tools:

| Destination                                       | Adapter mapping                                |
| ------------------------------------------------- | ---------------------------------------------- |
| Prometheus → Grafana                              | Counters, histograms, and memory gauges        |
| OpenTelemetry → Grafana Cloud or any OTLP backend | `MetricMeasurement.kind` → matching instrument |
| StatsD / Datadog                                  | Measurement kind and unit → vendor API         |
| Loki, Pino, Winston, or OpenTelemetry Logs        | `LoggerPort.write` → structured log            |

Grafana supports Prometheus as a built-in data source. Grafana Cloud also
accepts Prometheus metrics and OTLP, so the library does not force a monitoring
vendor or SDK into your application.

`MetricsPort`, `LoggerPort`, `ClockPort`, and `ResourceUsagePort` keep vendor
SDKs outside the instrumentation core. See the
[adapter guide](docs/reference/adapters.md) for a complete example.

Integration guides:

- [Expose Prometheus metrics for Grafana](docs/integrations/prometheus.md)
- [Send structured logs to Winston](docs/integrations/winston.md)

## Try it online

Open the [live playground](https://haskou.github.io/metrics/playground/) to run
successful and failed methods, inspect metrics and logs, and view captured
stack traces. Use
[StackBlitz](https://stackblitz.com/github/haskou/metrics?startScript=playground:dev)
if you also want to edit the example in your browser.

To run the same playground locally:

```bash
yarn install
yarn playground:dev
```

## Install

```bash
npm install @haskou/metrics
```

```bash
yarn add @haskou/metrics
```

`@Metrics` supports both standard TypeScript decorators and legacy decorators.
Enable `experimentalDecorators` only when your project still uses the legacy
implementation.

Read the [documentation](https://haskou.github.io/metrics/) for guides and
adapter examples.

## Releases

Merging a pull request into `main` or `master` publishes a new npm version after
CI passes. The source branch selects the version bump:

| Branch               | Version |
| -------------------- | ------- |
| `fix` or `fix/*`     | Patch   |
| `feat` or `feat/*`   | Minor   |
| `break` or `break/*` | Major   |

Renovate pull requests with a `fix:` or `fix(...):` title publish a patch. See
[RELEASING.md](RELEASING.md) for trusted publishing, tags, and release notes.

MIT. See [LICENSE.txt](LICENSE.txt).
