import type { MetricAttributes } from '../contracts/MetricAttributes.js';
import type { InstrumentationLogPrimitives } from './InstrumentationLogPrimitives.js';

import { OperationName, StackTrace } from '../values/index.js';
import { InstrumentationLogLevel } from './InstrumentationLogLevel.js';

export class InstrumentationLog {
  private readonly attributes: MetricAttributes;

  public static called(
    operation: OperationName,
    attributes: MetricAttributes,
  ): InstrumentationLog {
    return new InstrumentationLog(
      operation,
      InstrumentationLogLevel.CALLED,
      `${operation.valueOf()} called`,
      attributes,
    );
  }

  public static failed(
    operation: OperationName,
    attributes: MetricAttributes,
    error: unknown,
    captureStackTrace: boolean,
  ): InstrumentationLog {
    return new InstrumentationLog(
      operation,
      InstrumentationLogLevel.FAILED,
      `${operation.valueOf()} failed`,
      attributes,
      captureStackTrace ? StackTrace.fromError(error) : undefined,
    );
  }

  private constructor(
    private readonly operation: OperationName,
    private readonly level: InstrumentationLogLevel,
    private readonly message: string,
    attributes: MetricAttributes,
    private readonly stackTrace?: StackTrace,
  ) {
    this.attributes = Object.freeze({ ...attributes });
  }

  public isFailure(): boolean {
    return this.level.isFailure();
  }

  public toPrimitives(): InstrumentationLogPrimitives {
    return {
      attributes: this.attributes,
      level: this.level.valueOf(),
      message: this.message,
      operation: this.operation.valueOf(),
      ...(this.stackTrace ? { stackTrace: this.stackTrace.valueOf() } : {}),
    };
  }
}
