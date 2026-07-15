import { NonErrorThrownError } from '../../src/errors/NonErrorThrownError.js';

describe(NonErrorThrownError.name, () => {
  it('provides a stable error name and message', () => {
    const error = new NonErrorThrownError();

    expect(error.name).toBe('NonErrorThrownError');
    expect(error.message).toBe('A non-Error value was thrown');
  });
});
