import type { MetricKind } from '../configuration/index.js';
import type { MetricAttributes } from '../contracts/index.js';
import type { ResourceUsageSnapshot } from '../resources/index.js';
import type { ElapsedMilliseconds } from '../values/index.js';
import type { InstrumentationDependencies } from './InstrumentationDependencies.js';
import type { InstrumentationOptions } from './InstrumentationOptions.js';

import { InstrumentationLog } from '../logging/index.js';
import { MetricMeasurement } from '../metrics/index.js';
import { OperationName } from '../values/index.js';

export class InstrumentationExecution {
  private readonly attributes: MetricAttributes;
  private readonly operation: OperationName;
  private startedAt?: ElapsedMilliseconds;
  private startedResources?: ResourceUsageSnapshot;

  public constructor(
    operationName: string,
    private readonly dependencies: InstrumentationDependencies,
    private readonly options: InstrumentationOptions,
  ) {
    this.operation = new OperationName(operationName);
    this.attributes = Object.freeze({
      ...dependencies.attributes,
      ...(options.attributes ?? {}),
    });
  }

  private finish(): void {
    const finishedAt = this.startedAt
      ? this.safelyRead(() => this.dependencies.clock.now())
      : undefined;
    const finishedResources = this.shouldCaptureResources()
      ? this.safelyRead(() => this.dependencies.resourceUsage.capture())
      : undefined;

    if (this.startedAt && finishedAt) {
      this.observe(
        'duration',
        finishedAt.elapsedSince(this.startedAt).valueOf(),
      );
    }

    if (finishedResources) {
      this.recordResources(finishedResources);
    }
  }

  private recordResources(finished: ResourceUsageSnapshot): void {
    if (this.options.recordCpu === true && this.startedResources) {
      this.observe(
        'cpu.user',
        finished.getCpuUserSince(this.startedResources).valueOf(),
      );
      this.observe(
        'cpu.system',
        finished.getCpuSystemSince(this.startedResources).valueOf(),
      );
    }

    if (this.options.recordMemory !== true) {
      return;
    }

    this.observe('memory.rss', finished.getResidentSet().valueOf());
    this.observe('memory.heap_used', finished.getHeapUsed().valueOf());

    if (this.startedResources) {
      this.observe(
        'memory.rss_delta',
        finished.getResidentSetDeltaSince(this.startedResources).valueOf(),
      );
      this.observe(
        'memory.heap_used_delta',
        finished.getHeapUsedDeltaSince(this.startedResources).valueOf(),
      );
    }
  }

  private shouldCaptureResources(): boolean {
    return (
      this.options.recordCpu === true || this.options.recordMemory === true
    );
  }

  private increment(kind: MetricKind): void {
    this.safely(() =>
      this.dependencies.metrics.increment(
        new MetricMeasurement(
          this.operation,
          kind,
          this.metricName(kind),
          1,
          this.attributes,
        ),
      ),
    );
  }

  private observe(kind: MetricKind, value: number): void {
    this.safely(() =>
      this.dependencies.metrics.observe(
        new MetricMeasurement(
          this.operation,
          kind,
          this.metricName(kind),
          value,
          this.attributes,
        ),
      ),
    );
  }

  private metricName(kind: MetricKind): string {
    return this.dependencies.formatName(this.operation.valueOf(), kind);
  }

  private safely(action: () => void): void {
    try {
      action();
    } catch (error) {
      this.reportInstrumentationError(error);
    }
  }

  private safelyRead<Result>(action: () => Result): Result | undefined {
    try {
      return action();
    } catch (error) {
      this.reportInstrumentationError(error);

      return undefined;
    }
  }

  private reportInstrumentationError(error: unknown): void {
    try {
      this.dependencies.onInstrumentationError?.(error);
    } catch {
      // Instrumentation must never change application control flow.
    }
  }

  public start(): void {
    if (this.options.recordCalls !== false) {
      this.increment('calls');
    }

    if (this.options.logCalls !== false) {
      this.safely(() =>
        this.dependencies.logger.write(
          InstrumentationLog.called(this.operation, this.attributes),
        ),
      );
    }

    if (this.shouldCaptureResources()) {
      this.startedResources = this.safelyRead(() =>
        this.dependencies.resourceUsage.capture(),
      );
    }

    if (this.options.recordDuration !== false) {
      this.startedAt = this.safelyRead(() => this.dependencies.clock.now());
    }
  }

  public succeed(): void {
    this.finish();
  }

  public fail(error: unknown): void {
    this.finish();

    if (this.options.recordFailures !== false) {
      this.increment('failures');
    }

    if (this.options.logFailures !== false) {
      this.safely(() =>
        this.dependencies.logger.write(
          InstrumentationLog.failed(
            this.operation,
            this.attributes,
            error,
            this.options.captureStackTrace !== false,
          ),
        ),
      );
    }
  }
}
