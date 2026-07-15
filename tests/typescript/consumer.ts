import {
  Metrics,
  MetricsInstrumenter,
  configureMetrics,
  instrumentFunction,
  measure,
  metrics,
} from '@haskou/metrics';
import { ConsoleLoggerAdapter } from '@haskou/metrics/adapters/console';
import { NodeResourceUsageAdapter } from '@haskou/metrics/adapters/node';
import type {
  MetricKind,
  MetricNameFormatter,
  MetricsConfiguration,
  MetricsDefaults,
} from '@haskou/metrics/configuration';
import type { MetricsPort } from '@haskou/metrics/contracts';
import type { InstrumentationOptions } from '@haskou/metrics/instrumentation';
import type { MetricMeasurement } from '@haskou/metrics/model';
import {
  InMemoryLoggerAdapter,
  InMemoryMetricsAdapter,
  ManualClock,
  ManualResourceUsageAdapter,
} from '@haskou/metrics/testing';

interface CreateUser {
  readonly name: string;
}

interface User {
  readonly id: string;
}

class UserCreator {
  @Metrics()
  public async create(_command: CreateUser): Promise<User> {
    return { id: 'user-id' };
  }
}

class CustomAdapter implements MetricsPort {
  public increment(_measurement: MetricMeasurement): void {}

  public observe(_measurement: MetricMeasurement): void {}
}

const adapter: MetricsPort = new CustomAdapter();
const defaults: MetricsDefaults = { recordCpu: true };
const nameFormatter: MetricNameFormatter = (
  operation: string,
  kind: MetricKind,
) => `${operation}.${kind}`;
const configuration: MetricsConfiguration = {
  adapter,
  defaults,
  logger: new ConsoleLoggerAdapter(),
  nameFormatter,
  resourceUsage: new NodeResourceUsageAdapter(),
};
const instrumentationOptions: InstrumentationOptions = {
  attributes: { source: 'consumer' },
};
configureMetrics(configuration);

const creator = new UserCreator();
const userPromise: Promise<User> = creator.create({ name: 'Ada' });
const measuredPromise: Promise<User> = measure('users.create', () =>
  creator.create({ name: 'Grace' }),
);

function add(this: { readonly base: number }, value: number): number {
  return this.base + value;
}

const measuredAdd = instrumentFunction('numbers.add', add);
const total: number = measuredAdd.call({ base: 2 }, 3);

const inMemoryAdapter = new InMemoryMetricsAdapter();
const inMemoryLogger = new InMemoryLoggerAdapter();
const clock = new ManualClock();
const resources = new ManualResourceUsageAdapter();
const instrumenter = new MetricsInstrumenter({ adapter: inMemoryAdapter });
const defaultSnapshot = metrics.snapshot();

void userPromise;
void measuredPromise;
void total;
void inMemoryAdapter;
void inMemoryLogger;
void clock;
void resources;
void instrumenter;
void instrumentationOptions;
void defaultSnapshot;
