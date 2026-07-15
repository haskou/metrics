# Writing adapters

Metrics adapters implement the synchronous `MetricsPort` output port:

```typescript
import type { MetricMeasurement, MetricsPort } from '@haskou/metrics';

export class VendorMetricsAdapter implements MetricsPort {
  public constructor(private readonly client: VendorClient) {}

  public increment(measurement: MetricMeasurement): void {
    const { attributes, name, value } = measurement.toPrimitives();
    this.client.counter(name).add(value, attributes);
  }

  public observe(measurement: MetricMeasurement): void {
    const { attributes, kind, name, unit, value } = measurement.toPrimitives();

    if (kind.startsWith('memory.')) {
      this.client.gauge(name, { unit }).set(value, attributes);
      return;
    }

    this.client.histogram(name, { unit }).record(value, attributes);
  }
}
```

Keep buffering, batching, transport, and vendor-specific naming inside the
adapter. Port methods must return synchronously; they should not wait for
network I/O.

Use `nameFormatter` when a backend requires a different naming convention:

```typescript
configureMetrics({
  adapter,
  nameFormatter: (operation, kind) => `${operation}_${kind}`,
});
```

`nameFormatter` changes `MetricMeasurement.name`. An adapter may choose fixed
vendor names from `kind` instead. The built-in Prometheus adapter does this and
uses its own `prefix` option.

Adapter errors are contained and passed to `onInstrumentationError` when it is
configured. The library never logs them automatically.

## Integrations

- [Prometheus and Grafana](/integrations/prometheus)
- [Winston](/integrations/winston)

## Logging

Implement `LoggerPort.write(InstrumentationLog)` to connect a structured
logger. `InstrumentationLog.toPrimitives()` is the serialization boundary.

The built-in console adapter has a dedicated entrypoint:

```typescript
import { ConsoleLoggerAdapter } from '@haskou/metrics/adapters/console';

configureMetrics({
  adapter,
  logger: new ConsoleLoggerAdapter(),
});
```

`ConsoleLoggerAdapter` accepts an optional `ConsoleLike` object with `log` and
`error` methods. Inject one when the application uses a console-compatible
sink or when a test needs to capture output.

Call logs use `log`; failure logs use `error` and include `stackTrace` by
default. The library never includes method arguments or return values.

## CPU and memory

`ResourceUsagePort.capture()` returns a `ResourceUsageSnapshot`. Node.js
support is built in:

```typescript
import { NodeResourceUsageAdapter } from '@haskou/metrics/adapters/node';

configureMetrics({
  adapter,
  resourceUsage: new NodeResourceUsageAdapter(),
});
```

This is also the default resource adapter for configured instrumenters.
Sampling only occurs when `recordCpu` or `recordMemory` is true.

See [ports and telemetry records](/reference/contracts) for every port method,
measurement kind, unit, snapshot field, and structured log field.
