# Introduction

`@haskou/metrics` counts attempted calls and failures, measures elapsed and CPU
time, samples process memory, and emits structured lifecycle logs. It does not
select a metrics backend, depend on a framework, or inspect method arguments and
return values.

## Principles

- metrics, logging, clocks, and resource sampling behind explicit ports
- function and decorator APIs over the `MetricsInstrumenter` class
- no DDD or framework assumptions
- Value Objects for validated numeric values, operation names, and stack traces
- cohesive measurement, resource-snapshot, and log objects at port boundaries
- no automatic argument or return-value logging
- deterministic test doubles included under `@haskou/metrics/testing`

The default runtime stores telemetry in two bounded in-memory buffers. You can
try the decorator before choosing a backend or logger.

Adapter and clock failures are contained. Instrumentation cannot turn a
successful application operation into a failed one.
