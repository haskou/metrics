import { BoundedBuffer } from '../../src/in-memory/BoundedBuffer.js';
import { BufferCapacity } from '../../src/values/BufferCapacity.js';

describe(BoundedBuffer.name, () => {
  it('keeps insertion order before reaching capacity', () => {
    const buffer = new BoundedBuffer<string>(new BufferCapacity(2));

    buffer.push('first');

    expect(buffer.toArray()).toEqual(['first']);
    expect(buffer.getCapacity()).toBe(2);
    expect(buffer.getDiscarded()).toBe(0);
  });

  it('replaces the oldest item after reaching capacity', () => {
    const buffer = new BoundedBuffer<string>(new BufferCapacity(2));

    buffer.push('first');
    buffer.push('second');
    buffer.push('third');

    expect(buffer.toArray()).toEqual(['second', 'third']);
    expect(buffer.getDiscarded()).toBe(1);
  });

  it('clears entries and counters', () => {
    const buffer = new BoundedBuffer<string>(new BufferCapacity(1));
    buffer.push('first');
    buffer.push('second');

    buffer.clear();

    expect(buffer.toArray()).toEqual([]);
    expect(buffer.getDiscarded()).toBe(0);
  });
});
