import { MemoryByteDelta } from '../../src/values/MemoryByteDelta.js';

describe(MemoryByteDelta.name, () => {
  it('represents positive and negative memory changes', () => {
    expect(new MemoryByteDelta(-10).isLessThan(new MemoryByteDelta(0))).toBe(
      true,
    );
    expect(new MemoryByteDelta(10).isGreaterThan(new MemoryByteDelta(0))).toBe(
      true,
    );
  });
});
