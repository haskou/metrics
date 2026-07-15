# Testing

Import test doubles from the dedicated entrypoint:

```typescript
import { configureMetrics, measure } from '@haskou/metrics';
import {
  InMemoryLoggerAdapter,
  InMemoryMetricsAdapter,
  ManualClock,
  ManualResourceUsageAdapter,
} from '@haskou/metrics/testing';

const adapter = new InMemoryMetricsAdapter();
const clock = new ManualClock();
const logger = new InMemoryLoggerAdapter();
const resources = new ManualResourceUsageAdapter();
const restore = configureMetrics({
  adapter,
  clock,
  logger,
  resourceUsage: resources,
});

measure('users.create', () => {
  clock.advance(8);
  return user;
});

expect(adapter.increments).toContainEqual(
  expect.objectContaining({
    name: 'users.create.calls',
    value: 1,
    attributes: {},
  }),
);
expect(adapter.observations[0]?.value).toBe(8);

restore();
```

`InMemoryMetricsAdapter` records counters and observations.
`InMemoryLoggerAdapter` records serialized log entries. `ManualClock` controls
elapsed time, while `ManualResourceUsageAdapter` controls CPU and memory
snapshots. No-op metrics, logger, and resource adapters are also available from
this testing entrypoint.

## Included doubles

| Double                       | Control and observations                       |
| ---------------------------- | ---------------------------------------------- |
| `InMemoryMetricsAdapter`     | `increments`, `observations`, and `clear()`    |
| `InMemoryLoggerAdapter`      | `entries` and `clear()`                        |
| `ManualClock`                | Initial milliseconds, `advance()`, and `set()` |
| `ManualResourceUsageAdapter` | Initial resource values and `set()`            |
| `NoopMetricsAdapter`         | Discards metric measurements                   |
| `NoopLoggerAdapter`          | Discards structured logs                       |
| `NoopResourceUsageAdapter`   | Returns an empty resource snapshot             |

`RecordedIncrement` and `RecordedObservation` are aliases of
`MetricMeasurementPrimitives`, so tests can assert `kind`, `unit`, `operation`,
`name`, `value`, and `attributes` without using a vendor SDK.
