import type { ElapsedMilliseconds } from '../values/index.js';

/** Monotonic clock used to measure elapsed milliseconds. */
export interface ClockPort {
  now(): ElapsedMilliseconds;
}
