import type { ClockPort } from '../../contracts/index.js';

import { ElapsedMilliseconds } from '../../values/index.js';

export class SystemClock implements ClockPort {
  public now(): ElapsedMilliseconds {
    return new ElapsedMilliseconds(performance.now());
  }
}
