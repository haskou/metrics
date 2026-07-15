import type { MetricKind } from '../configuration/index.js';
import type { MetricAttributes } from '../contracts/MetricAttributes.js';
import type { MetricUnit } from './MetricUnit.js';

export interface MetricMeasurementPrimitives {
  readonly attributes: MetricAttributes;
  readonly kind: MetricKind;
  readonly name: string;
  readonly operation: string;
  readonly unit: MetricUnit;
  readonly value: number;
}
