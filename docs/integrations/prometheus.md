# Prometheus and Grafana

The built-in adapter uses `prom-client` as an optional peer dependency:

```bash
npm install prom-client
```

## Configure the registry

```typescript
import { Registry } from 'prom-client';
import { configureMetrics } from '@haskou/metrics';
import { PrometheusMetricsAdapter } from '@haskou/metrics/adapters/prometheus';

export const registry = new Registry();

configureMetrics({
  adapter: new PrometheusMetricsAdapter({
    attributeNames: ['service', 'environment'],
    prefix: 'my_app',
    registry,
  }),
  attributes: {
    environment: 'production',
    service: 'users-api',
  },
});
```

The adapter always adds an `operation` label. It only promotes attributes named
in `attributeNames`; missing attributes become empty label values and booleans
become strings. Keep operation names and attribute values bounded to control
cardinality.

## Cardinality rules

Never promote identifiers, full URLs, request IDs, user IDs, tenant IDs with
unbounded growth, error messages, stack traces, email addresses, or free-form
input as Prometheus labels. Prometheus stores a new time series for every unique
label set, so one accidental `userId` or raw URL label can dominate storage and
query cost.

Prefer bounded labels such as `service`, `environment`, `method`, `route`,
`status`, `queue`, or explicit operation names like `users.create`.

## Expose a scrape endpoint

Prometheus needs an HTTP endpoint that returns `registry.metrics()` with the
registry content type. This Node.js example has no framework dependency:

```typescript
import { createServer } from 'node:http';

import { registry } from './metrics.js';

createServer(async (request, response) => {
  if (request.url !== '/metrics') {
    response.writeHead(404).end();
    return;
  }

  response.setHeader('Content-Type', registry.contentType);
  response.end(await registry.metrics());
}).listen(9464);
```

Configure Prometheus to scrape the service:

```yaml
scrape_configs:
  - job_name: users-api
    static_configs:
      - targets: ['users-api:9464']
```

Grafana queries Prometheus as a data source; it does not scrape the application
endpoint itself. Restrict access to `/metrics` when labels or process values
could expose operational details.

## Emitted metrics

With the default `haskou_metrics_` prefix, the adapter registers:

| Name                                          | Type      | Unit    |
| --------------------------------------------- | --------- | ------- |
| `haskou_metrics_calls_total`                  | Counter   | Count   |
| `haskou_metrics_failures_total`               | Counter   | Count   |
| `haskou_metrics_duration_seconds`             | Histogram | Seconds |
| `haskou_metrics_cpu_user_seconds`             | Histogram | Seconds |
| `haskou_metrics_cpu_system_seconds`           | Histogram | Seconds |
| `haskou_metrics_memory_rss_bytes`             | Gauge     | Bytes   |
| `haskou_metrics_memory_heap_used_bytes`       | Gauge     | Bytes   |
| `haskou_metrics_memory_rss_delta_bytes`       | Gauge     | Bytes   |
| `haskou_metrics_memory_heap_used_delta_bytes` | Gauge     | Bytes   |

The adapter converts core duration milliseconds and CPU microseconds to
seconds. Memory values remain bytes.

## Adapter options

| Option                   | Meaning                                   | Default                   |
| ------------------------ | ----------------------------------------- | ------------------------- |
| `registry`               | `prom-client` registry                    | Required                  |
| `prefix`                 | Prefix for every Prometheus metric family | `haskou_metrics_`         |
| `attributeNames`         | Attributes promoted to labels             | `[]`                      |
| `durationBucketsSeconds` | Duration histogram buckets                | Built-in latency buckets  |
| `cpuBucketsSeconds`      | User and system CPU histogram buckets     | Built-in CPU-time buckets |

The adapter normalizes invalid prefix characters to underscores and adds a
trailing underscore when needed. An empty prefix disables prefixing.

`MetricsConfiguration.prefix` and `nameFormatter` change the generic
`MetricMeasurement.name`. The Prometheus adapter uses fixed metric families
from `MetricMeasurement.kind`, so configure its `prefix` option instead.

For registry and exposition behavior, see the
[`prom-client` documentation](https://github.com/siimon/prom-client).
