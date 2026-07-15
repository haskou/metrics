import type { DecoratedMethod } from './DecoratedMethod.js';
import type { InstrumentationOptions } from './InstrumentationOptions.js';

import { MetricsRuntime } from './MetricsRuntime.js';

/** Instruments a synchronous or asynchronous function without inspecting it. */
export function measure<Result>(
  name: string,
  operation: () => Promise<Result>,
  options?: InstrumentationOptions,
): Promise<Result>;
export function measure<Result>(
  name: string,
  operation: () => Result,
  options?: InstrumentationOptions,
): Result;
export function measure<Result>(
  name: string,
  operation: () => Result,
  options: InstrumentationOptions = {},
): Result {
  return MetricsRuntime.current().measure(name, operation, options);
}

export function instrumentFunction<This, Arguments extends unknown[], Result>(
  name: string,
  operation: DecoratedMethod<This, Arguments, Result>,
  options: InstrumentationOptions = {},
): DecoratedMethod<This, Arguments, Result> {
  return function instrumented(this: This, ...arguments_: Arguments): Result {
    return MetricsRuntime.current().measure(
      name,
      () => operation.apply(this, arguments_),
      options,
    );
  };
}
