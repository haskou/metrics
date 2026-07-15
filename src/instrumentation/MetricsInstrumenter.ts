import type {
  MetricKind,
  MetricNameFormatter,
  MetricsConfiguration,
  MetricsDefaults,
} from '../configuration/index.js';
import type { DecoratedMethod } from './DecoratedMethod.js';
import type { InstrumentationDependencies } from './InstrumentationDependencies.js';
import type { InstrumentationOptions } from './InstrumentationOptions.js';

import { NodeResourceUsageAdapter } from '../adapters/node/NodeResourceUsageAdapter.js';
import { SystemClock } from '../adapters/system/SystemClock.js';
import { InstrumentationExecution } from './InstrumentationExecution.js';
import { NoopLoggerAdapter } from './NoopLoggerAdapter.js';
import { NoopMetricsAdapter } from './NoopMetricsAdapter.js';
import { NoopResourceUsageAdapter } from './NoopResourceUsageAdapter.js';

export class MetricsInstrumenter {
  private readonly dependencies: InstrumentationDependencies;
  private readonly defaults: MetricsDefaults;

  private static defaultsFrom(
    configuration: MetricsConfiguration,
  ): MetricsDefaults {
    return Object.freeze({ ...(configuration.defaults ?? {}) });
  }

  public static disabled(): MetricsInstrumenter {
    return new MetricsInstrumenter(
      {
        adapter: new NoopMetricsAdapter(),
        logger: new NoopLoggerAdapter(),
        resourceUsage: new NoopResourceUsageAdapter(),
      },
      false,
    );
  }

  public constructor(
    configuration: MetricsConfiguration,
    private readonly enabled = true,
  ) {
    const prefix = configuration.prefix ? `${configuration.prefix}.` : '';
    const formatter: MetricNameFormatter =
      configuration.nameFormatter ??
      ((operationName: string, kind: MetricKind) => `${operationName}.${kind}`);
    this.defaults = MetricsInstrumenter.defaultsFrom(configuration);

    this.dependencies = {
      attributes: Object.freeze({ ...(configuration.attributes ?? {}) }),
      clock: configuration.clock ?? new SystemClock(),
      formatName: (operationName, kind) =>
        formatter(`${prefix}${operationName}`, kind),
      logger: configuration.logger ?? new NoopLoggerAdapter(),
      metrics: configuration.adapter,
      onInstrumentationError: configuration.onInstrumentationError,
      resourceUsage:
        configuration.resourceUsage ?? new NodeResourceUsageAdapter(),
    };
  }

  private isPromiseLike<Result>(
    value: Result,
  ): value is Result & PromiseLike<unknown> {
    return (
      ((typeof value === 'object' && value !== null) ||
        typeof value === 'function') &&
      'then' in value &&
      typeof value.then === 'function'
    );
  }

  private loggingOptionsWithDefaults(
    options: InstrumentationOptions,
  ): InstrumentationOptions {
    return {
      captureStackTrace:
        options.captureStackTrace ?? this.defaults.captureStackTrace,
      logCalls: options.logCalls ?? this.defaults.logCalls,
      logFailures: options.logFailures ?? this.defaults.logFailures,
    };
  }

  private recordingOptionsWithDefaults(
    options: InstrumentationOptions,
  ): InstrumentationOptions {
    return {
      recordCalls: options.recordCalls ?? this.defaults.recordCalls,
      recordCpu: options.recordCpu ?? this.defaults.recordCpu,
      recordDuration: options.recordDuration ?? this.defaults.recordDuration,
      recordFailures: options.recordFailures ?? this.defaults.recordFailures,
      recordMemory: options.recordMemory ?? this.defaults.recordMemory,
    };
  }

  private optionsWithDefaults(
    options: InstrumentationOptions,
  ): InstrumentationOptions {
    return {
      attributes: options.attributes,
      ...this.loggingOptionsWithDefaults(options),
      ...this.recordingOptionsWithDefaults(options),
    };
  }

  public measure<Result>(
    name: string,
    operation: () => Result,
    options: InstrumentationOptions = {},
  ): Result {
    if (!this.enabled) {
      return operation();
    }

    const execution = new InstrumentationExecution(
      name,
      this.dependencies,
      this.optionsWithDefaults(options),
    );
    execution.start();

    try {
      const result = operation();

      if (this.isPromiseLike(result)) {
        return Promise.resolve(result).then(
          (value) => {
            execution.succeed();

            return value;
          },
          (error: unknown) => {
            execution.fail(error);
            throw error;
          },
        ) as Result;
      }

      execution.succeed();

      return result;
    } catch (error) {
      execution.fail(error);
      throw error;
    }
  }

  public instrument<This, Arguments extends unknown[], Result>(
    name: string,
    operation: DecoratedMethod<This, Arguments, Result>,
    options: InstrumentationOptions = {},
  ): DecoratedMethod<This, Arguments, Result> {
    const measure = this.measure.bind(this);

    return function instrumented(this: This, ...arguments_: Arguments): Result {
      return measure(name, () => operation.apply(this, arguments_), options);
    };
  }
}
