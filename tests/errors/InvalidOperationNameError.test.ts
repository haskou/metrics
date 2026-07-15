import { InvalidOperationNameError } from '../../src/errors/InvalidOperationNameError.js';

describe(InvalidOperationNameError.name, () => {
  it('provides a stable error name and message', () => {
    const error = new InvalidOperationNameError();

    expect(error.name).toBe('InvalidOperationNameError');
    expect(error.message).toBe('Metric operation name cannot be empty');
  });
});
