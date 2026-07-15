import type { LoggerPort } from '../../contracts/LoggerPort.js';
import type { InstrumentationLog } from '../../logging/InstrumentationLog.js';
import type { ConsoleLike } from './ConsoleLike.js';

export class ConsoleLoggerAdapter implements LoggerPort {
  public constructor(private readonly output: ConsoleLike = console) {}

  public write(entry: InstrumentationLog): void {
    const { message, ...context } = entry.toPrimitives();

    if (entry.isFailure()) {
      this.output.error(message, context);

      return;
    }

    this.output.log(message, context);
  }
}
