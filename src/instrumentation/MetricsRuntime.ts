import type { MetricsConfiguration } from '../configuration/index.js';
import type { MetricsInspectionSnapshot } from '../in-memory/index.js';

import {
  BoundedInMemoryLoggerAdapter,
  BoundedInMemoryMetricsAdapter,
} from '../in-memory/index.js';
import { MetricsInstrumenter } from './MetricsInstrumenter.js';

export class MetricsRuntime {
  private static metricsBuffer = new BoundedInMemoryMetricsAdapter();
  private static logsBuffer = new BoundedInMemoryLoggerAdapter();
  private static active = this.defaultInstrumenter();

  private static defaultInstrumenter(): MetricsInstrumenter {
    return new MetricsInstrumenter({
      adapter: this.metricsBuffer,
      logger: this.logsBuffer,
    });
  }

  public static current(): MetricsInstrumenter {
    return this.active;
  }

  public static configure(configuration: MetricsConfiguration): () => void {
    const previous = this.active;
    const previousMetricsBuffer = this.metricsBuffer;
    const previousLogsBuffer = this.logsBuffer;
    const configured = new MetricsInstrumenter(configuration);
    this.active = configured;
    this.metricsBuffer = new BoundedInMemoryMetricsAdapter();
    this.logsBuffer = new BoundedInMemoryLoggerAdapter();

    let restored = false;

    return () => {
      if (!restored && this.active === configured) {
        this.active = previous;
        this.metricsBuffer = previousMetricsBuffer;
        this.logsBuffer = previousLogsBuffer;
        restored = true;
      }
    };
  }

  public static reset(): void {
    this.metricsBuffer = new BoundedInMemoryMetricsAdapter();
    this.logsBuffer = new BoundedInMemoryLoggerAdapter();
    this.active = this.defaultInstrumenter();
  }

  public static snapshot(): MetricsInspectionSnapshot {
    return Object.freeze({
      capacity: Object.freeze({
        logs: this.logsBuffer.getCapacity(),
        metrics: this.metricsBuffer.getCapacity(),
      }),
      discarded: Object.freeze({
        logs: this.logsBuffer.getDiscarded(),
        metrics: this.metricsBuffer.getDiscarded(),
      }),
      logs: this.logsBuffer.snapshot(),
      metrics: this.metricsBuffer.snapshot(),
    });
  }

  public static clear(): void {
    this.metricsBuffer.clear();
    this.logsBuffer.clear();
  }
}
