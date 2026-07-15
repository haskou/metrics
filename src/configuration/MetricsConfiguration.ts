import type { ClockPort } from '../contracts/ClockPort.js';
import type { LoggerPort } from '../contracts/LoggerPort.js';
import type { MetricAttributes } from '../contracts/MetricAttributes.js';
import type { MetricsPort } from '../contracts/MetricsPort.js';
import type { ResourceUsagePort } from '../contracts/ResourceUsagePort.js';
import type { MetricNameFormatter } from './MetricNameFormatter.js';
import type { MetricsDefaults } from './MetricsDefaults.js';

export interface MetricsConfiguration {
  readonly adapter: MetricsPort;
  readonly attributes?: MetricAttributes;
  readonly clock?: ClockPort;
  readonly defaults?: MetricsDefaults;
  readonly logger?: LoggerPort;
  readonly nameFormatter?: MetricNameFormatter;
  /** Receives instrumentation failures. It must not throw. */
  readonly onInstrumentationError?: (error: unknown) => void;
  readonly prefix?: string;
  readonly resourceUsage?: ResourceUsagePort;
}
