import { UnsupportedPrometheusMetricError } from '../../src/errors/UnsupportedPrometheusMetricError.js';

describe(UnsupportedPrometheusMetricError.name, () => {
  it('describes the unsupported metric operation', () => {
    const error = new UnsupportedPrometheusMetricError('calls', 'observe');

    expect(error.name).toBe('UnsupportedPrometheusMetricError');
    expect(error.message).toBe('Prometheus cannot observe metric kind "calls"');
  });
});
