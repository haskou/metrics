import type { MetricsConfiguration } from '../configuration/index.js';

import { MetricsRuntime } from './MetricsRuntime.js';

export function configureMetrics(
  configuration: MetricsConfiguration,
): () => void {
  return MetricsRuntime.configure(configuration);
}
