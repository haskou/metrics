import { InvalidBufferCapacityError } from '../../src/errors/InvalidBufferCapacityError.js';

describe(InvalidBufferCapacityError.name, () => {
  it('provides a stable error name and message', () => {
    const error = new InvalidBufferCapacityError();

    expect(error.name).toBe('InvalidBufferCapacityError');
    expect(error.message).toBe(
      'In-memory capacity must be an integer greater than zero',
    );
  });
});
