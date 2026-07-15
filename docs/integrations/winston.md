# Winston

`@haskou/metrics` keeps logging behind `LoggerPort`, so Winston remains an
application dependency:

```bash
npm install winston
```

## Create the adapter

```typescript
import type { Logger } from 'winston';
import type { InstrumentationLog, LoggerPort } from '@haskou/metrics';

export class WinstonLoggerAdapter implements LoggerPort {
  public constructor(private readonly logger: Logger) {}

  public write(entry: InstrumentationLog): void {
    const {
      attributes,
      level: lifecycle,
      message,
      operation,
      stackTrace,
    } = entry.toPrimitives();

    this.logger.log({
      attributes,
      level: entry.isFailure() ? 'error' : 'info',
      lifecycle,
      message,
      operation,
      ...(stackTrace ? { stack: stackTrace } : {}),
    });
  }
}
```

The adapter maps lifecycle calls to Winston `info` and failures to `error`. It
keeps instrumentation attributes nested so an attribute cannot replace Winston
fields such as `level` or `message`. Failure stack traces use Winston's
conventional `stack` field.

## Configure Winston and metrics

```typescript
import { createLogger, format, transports } from 'winston';
import { Registry } from 'prom-client';
import { configureMetrics } from '@haskou/metrics';
import { PrometheusMetricsAdapter } from '@haskou/metrics/adapters/prometheus';

import { WinstonLoggerAdapter } from './WinstonLoggerAdapter.js';

const logger = createLogger({
  exitOnError: false,
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'application.log' }),
  ],
});

configureMetrics({
  adapter: new PrometheusMetricsAdapter({ registry: new Registry() }),
  attributes: { service: 'users-api' },
  logger: new WinstonLoggerAdapter(logger),
});
```

Winston's `logger.log` call returns synchronously while its transports handle
their own output. That matches `LoggerPort`: instrumentation does not wait for
file or network transports.

The resulting JSON contains fields like:

```json
{
  "attributes": { "service": "users-api" },
  "level": "error",
  "lifecycle": "failed",
  "message": "UserCreator.create failed",
  "operation": "UserCreator.create",
  "stack": "Error: ...",
  "timestamp": "2026-07-15T12:00:00.000Z"
}
```

Instrumentation does not include method arguments or return values. Review
static attributes before forwarding logs to shared systems because they may
still contain sensitive application metadata.

Winston supports console, file, HTTP, and community transports. See the
official [Winston documentation](https://github.com/winstonjs/winston) for
formats, levels, and transport configuration.
