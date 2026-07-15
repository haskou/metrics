import { BufferCapacity } from '../values/index.js';

export class BoundedBuffer<Item> {
  private readonly entries: Array<Item | undefined>;
  private readonly maxEntries: number;
  private count = 0;
  private discarded = 0;
  private writeIndex = 0;

  public constructor(capacity: BufferCapacity) {
    this.maxEntries = capacity.valueOf();
    this.entries = new Array<Item | undefined>(this.maxEntries);
  }

  public push(item: Item): void {
    this.entries[this.writeIndex] = item;
    this.writeIndex = (this.writeIndex + 1) % this.maxEntries;

    if (this.count < this.maxEntries) {
      this.count += 1;

      return;
    }

    this.discarded += 1;
  }

  public toArray(): readonly Item[] {
    const items: Item[] = [];
    const start = this.count === this.maxEntries ? this.writeIndex : 0;

    for (let index = 0; index < this.count; index += 1) {
      const item = this.entries[(start + index) % this.maxEntries];

      if (item !== undefined) {
        items.push(item);
      }
    }

    return Object.freeze(items);
  }

  public clear(): void {
    this.entries.fill(undefined);
    this.count = 0;
    this.discarded = 0;
    this.writeIndex = 0;
  }

  public getCapacity(): number {
    return this.maxEntries;
  }

  public getDiscarded(): number {
    return this.discarded;
  }
}
