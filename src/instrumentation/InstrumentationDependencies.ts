import type { MetricKind } from '../configuration/index.js';
import type {
  ClockPort,
  LoggerPort,
  MetricAttributes,
  MetricsPort,
  ResourceUsagePort,
} from '../contracts/index.js';

export interface InstrumentationDependencies {
  readonly attributes: MetricAttributes;
  readonly clock: ClockPort;
  readonly formatName: (operationName: string, kind: MetricKind) => string;
  readonly logger: LoggerPort;
  readonly metrics: MetricsPort;
  readonly onInstrumentationError?: (error: unknown) => void;
  readonly resourceUsage: ResourceUsagePort;
}
