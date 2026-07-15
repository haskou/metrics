import type { MetricsInspectionSnapshot } from '../in-memory/index.js';

import { MetricsRuntime } from './MetricsRuntime.js';

export class MetricsInspector {
  public snapshot(): MetricsInspectionSnapshot {
    return MetricsRuntime.snapshot();
  }

  public clear(): void {
    MetricsRuntime.clear();
  }
}
