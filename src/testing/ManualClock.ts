import type { ClockPort } from '../contracts/index.js';

import { ElapsedMilliseconds } from '../values/index.js';

/** Deterministic monotonic clock for tests. */
export class ManualClock implements ClockPort {
  private currentTime: ElapsedMilliseconds;

  public constructor(milliseconds = 0) {
    this.currentTime = new ElapsedMilliseconds(milliseconds);
  }

  public advance(milliseconds: number): void {
    this.currentTime = new ElapsedMilliseconds(
      this.currentTime.add(milliseconds),
    );
  }

  public now(): ElapsedMilliseconds {
    return this.currentTime;
  }

  public set(milliseconds: number): void {
    this.currentTime = new ElapsedMilliseconds(milliseconds);
  }
}
