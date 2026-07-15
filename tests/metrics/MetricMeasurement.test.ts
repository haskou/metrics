import { MetricMeasurement } from '../../src/metrics/MetricMeasurement.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(MetricMeasurement.name, () => {
  it('serializes cohesive metric metadata and isolates attributes', () => {
    const attributes = { service: 'api' };
    const measurement = new MetricMeasurement(
      new OperationName('users.create'),
      'duration',
      'users.create.duration',
      12,
      attributes,
    );

    attributes.service = 'worker';

    expect(measurement.toPrimitives()).toEqual({
      attributes: { service: 'api' },
      kind: 'duration',
      name: 'users.create.duration',
      operation: 'users.create',
      unit: 'milliseconds',
      value: 12,
    });
    expect(Object.isFrozen(measurement.toPrimitives())).toBe(true);
    expect(Object.isFrozen(measurement.toPrimitives().attributes)).toBe(true);
  });

  it.each([
    ['calls', 'count'],
    ['cpu.system', 'microseconds'],
    ['cpu.user', 'microseconds'],
    ['failures', 'count'],
    ['memory.heap_used', 'bytes'],
    ['memory.heap_used_delta', 'bytes'],
    ['memory.rss', 'bytes'],
    ['memory.rss_delta', 'bytes'],
  ] as const)('maps %s to %s', (kind, unit) => {
    const measurement = new MetricMeasurement(
      new OperationName('operation'),
      kind,
      `operation.${kind}`,
      1,
      {},
    );

    expect(measurement.toPrimitives().unit).toBe(unit);
  });
});
