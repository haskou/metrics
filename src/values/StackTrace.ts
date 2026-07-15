import { StringValueObject } from '@haskou/value-objects';

import { NonErrorThrownError } from '../errors/index.js';

export class StackTrace extends StringValueObject {
  private static readonly MAX_LENGTH = 65_536;

  public static fromError(error: unknown): StackTrace {
    if (error instanceof Error && error.stack) {
      return new StackTrace(error.stack);
    }

    const fallback = new NonErrorThrownError().stack;

    return new StackTrace(fallback ?? 'Stack trace unavailable');
  }

  public constructor(value: string | StringValueObject) {
    super(value, StackTrace.MAX_LENGTH);
  }
}
