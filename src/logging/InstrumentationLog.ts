import type { MetricAttributes } from '../contracts/MetricAttributes.js';
import type { InstrumentationErrorPrimitives } from './InstrumentationErrorPrimitives.js';
import type { InstrumentationLogPrimitives } from './InstrumentationLogPrimitives.js';

import { NonErrorThrownError } from '../errors/index.js';
import { OperationName, StackTrace } from '../values/index.js';
import { InstrumentationLogLevel } from './InstrumentationLogLevel.js';

export class InstrumentationLog {
  private readonly attributes: MetricAttributes;

  private static errorCode(error: Error): string | undefined {
    if (
      'code' in error &&
      (typeof error.code === 'string' || typeof error.code === 'number')
    ) {
      return String(error.code);
    }

    return undefined;
  }

  private static errorPrimitives(
    error: unknown,
    captureStackTrace: boolean,
  ): InstrumentationErrorPrimitives {
    if (error instanceof Error) {
      return Object.freeze({
        ...(InstrumentationLog.errorCode(error)
          ? { code: InstrumentationLog.errorCode(error) }
          : {}),
        message: error.message,
        name: error.name,
        ...(captureStackTrace && error.stack ? { stack: error.stack } : {}),
      });
    }

    const fallback = new NonErrorThrownError();

    return Object.freeze({
      message: fallback.message,
      name: fallback.name,
      ...(captureStackTrace && fallback.stack ? { stack: fallback.stack } : {}),
    });
  }

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
      InstrumentationLog.errorPrimitives(error, captureStackTrace),
      captureStackTrace ? StackTrace.fromError(error) : undefined,
    );
  }

  private constructor(
    private readonly operation: OperationName,
    private readonly level: InstrumentationLogLevel,
    private readonly message: string,
    attributes: MetricAttributes,
    private readonly error?: InstrumentationErrorPrimitives,
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
      ...(this.error ? { error: this.error } : {}),
      ...(this.stackTrace ? { stackTrace: this.stackTrace.valueOf() } : {}),
    };
  }
}
