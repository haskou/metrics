import type { InstrumentationDependencies } from '../../src/instrumentation/InstrumentationDependencies.js';

import { InstrumentationExecution } from '../../src/instrumentation/InstrumentationExecution.js';
import { InMemoryLoggerAdapter } from '../../src/testing/InMemoryLoggerAdapter.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';
import { ManualClock } from '../../src/testing/ManualClock.js';
import { ManualResourceUsageAdapter } from '../../src/testing/ManualResourceUsageAdapter.js';

describe(InstrumentationExecution.name, () => {
  const createContext = (
    overrides: Partial<InstrumentationDependencies> = {},
  ) => {
    const clock = new ManualClock();
    const logger = new InMemoryLoggerAdapter();
    const metrics = new InMemoryMetricsAdapter();
    const resourceUsage = new ManualResourceUsageAdapter();
    const dependencies: InstrumentationDependencies = {
      attributes: { service: 'api', shared: 'global' },
      clock,
      formatName: (operation, kind) => `${operation}.${kind}`,
      logger,
      metrics,
      resourceUsage,
      ...overrides,
    };

    return { clock, dependencies, logger, metrics, resourceUsage };
  };

  it('records calls, duration, resources, and merged attributes', () => {
    const { clock, dependencies, metrics, resourceUsage } = createContext();
    const execution = new InstrumentationExecution(
      'reports.generate',
      dependencies,
      {
        attributes: { shared: 'local' },
        recordCpu: true,
        recordMemory: true,
      },
    );

    execution.start();
    clock.advance(5);
    resourceUsage.set({
      cpuSystemMicroseconds: 7,
      cpuUserMicroseconds: 40,
      heapUsedBytes: 360,
      residentSetBytes: 950,
    });
    execution.succeed();

    expect(metrics.increments[0]).toEqual({
      attributes: { service: 'api', shared: 'local' },
      kind: 'calls',
      name: 'reports.generate.calls',
      operation: 'reports.generate',
      unit: 'count',
      value: 1,
    });
    expect(metrics.observations.map(({ name }) => name)).toEqual([
      'reports.generate.duration',
      'reports.generate.cpu.user',
      'reports.generate.cpu.system',
      'reports.generate.memory.rss',
      'reports.generate.memory.heap_used',
      'reports.generate.memory.rss_delta',
      'reports.generate.memory.heap_used_delta',
    ]);
  });

  it('records CPU without memory observations', () => {
    const { dependencies, metrics, resourceUsage } = createContext();
    const execution = new InstrumentationExecution('cpu.only', dependencies, {
      recordCpu: true,
      recordDuration: false,
    });

    execution.start();
    resourceUsage.set({
      cpuSystemMicroseconds: 3,
      cpuUserMicroseconds: 5,
      heapUsedBytes: 10,
      residentSetBytes: 20,
    });
    execution.succeed();

    expect(metrics.observations.map(({ name }) => name)).toEqual([
      'cpu.only.cpu.user',
      'cpu.only.cpu.system',
    ]);
  });

  it('records failures and supports disabled signals', () => {
    const { dependencies, logger, metrics } = createContext();
    const execution = new InstrumentationExecution(
      'quiet.failure',
      dependencies,
      {
        captureStackTrace: false,
        logCalls: false,
        logFailures: false,
        recordCalls: false,
        recordDuration: false,
        recordFailures: false,
      },
    );

    execution.start();
    execution.fail(new Error('failed'));

    expect(metrics.increments).toEqual([]);
    expect(metrics.observations).toEqual([]);
    expect(logger.entries).toEqual([]);
  });

  it('contains failures from instrumentation dependencies', () => {
    const reported: unknown[] = [];
    const expectedError = new Error('unavailable');
    const { dependencies } = createContext({
      onInstrumentationError: (error: unknown) => {
        reported.push(error);
        throw new Error('handler failed');
      },
    });
    dependencies.metrics.increment = () => {
      throw expectedError;
    };
    dependencies.metrics.observe = () => {
      throw expectedError;
    };
    dependencies.logger.write = () => {
      throw expectedError;
    };
    dependencies.clock.now = () => {
      throw expectedError;
    };
    dependencies.resourceUsage.capture = () => {
      throw expectedError;
    };
    const execution = new InstrumentationExecution('safe', dependencies, {
      recordCpu: true,
      recordMemory: true,
    });

    expect(() => {
      execution.start();
      execution.fail(expectedError);
    }).not.toThrow();
    expect(reported).toEqual(Array<unknown>(7).fill(expectedError));
  });
});
