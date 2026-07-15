import type { MetricKind } from '../configuration/index.js';
import type { MetricAttributes } from '../contracts/MetricAttributes.js';
import type { MetricMeasurementPrimitives } from './MetricMeasurementPrimitives.js';
import type { MetricUnit } from './MetricUnit.js';

import { OperationName } from '../values/OperationName.js';

export class MetricMeasurement {
  private static readonly units: Readonly<Record<MetricKind, MetricUnit>> = {
    calls: 'count',
    'cpu.system': 'microseconds',
    'cpu.user': 'microseconds',
    duration: 'milliseconds',
    failures: 'count',
    'memory.heap_used': 'bytes',
    'memory.heap_used_delta': 'bytes',
    'memory.rss': 'bytes',
    'memory.rss_delta': 'bytes',
  };

  private readonly attributes: MetricAttributes;

  public constructor(
    private readonly operation: OperationName,
    private readonly kind: MetricKind,
    private readonly name: string,
    private readonly value: number,
    attributes: MetricAttributes,
  ) {
    this.attributes = Object.freeze({ ...attributes });
  }

  public toPrimitives(): MetricMeasurementPrimitives {
    return Object.freeze({
      attributes: this.attributes,
      kind: this.kind,
      name: this.name,
      operation: this.operation.valueOf(),
      unit: MetricMeasurement.units[this.kind],
      value: this.value,
    });
  }
}
