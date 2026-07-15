import type { LegacyMetricsMethodDecorator } from './LegacyMetricsMethodDecorator.js';
import type { StandardMetricsMethodDecorator } from './StandardMetricsMethodDecorator.js';

export type MetricsMethodDecorator = LegacyMetricsMethodDecorator &
  StandardMetricsMethodDecorator;
