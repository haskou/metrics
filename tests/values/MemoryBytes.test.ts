import { MemoryByteDelta } from '../../src/values/MemoryByteDelta.js';
import { MemoryBytes } from '../../src/values/MemoryBytes.js';

describe(MemoryBytes.name, () => {
  it('calculates signed memory differences', () => {
    const difference = new MemoryBytes(90).differenceSince(
      new MemoryBytes(100),
    );

    expect(difference.isEqual(new MemoryByteDelta(-10))).toBe(true);
  });
});
