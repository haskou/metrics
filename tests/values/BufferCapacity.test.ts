import { InvalidBufferCapacityError } from '../../src/errors/InvalidBufferCapacityError.js';
import { BufferCapacity } from '../../src/values/BufferCapacity.js';

describe(BufferCapacity.name, () => {
  it('accepts positive integer capacities', () => {
    expect(new BufferCapacity(2).isEqual(new BufferCapacity(2))).toBe(true);
  });

  it('rejects zero', () => {
    expect(() => new BufferCapacity(0)).toThrow(InvalidBufferCapacityError);
  });
});
