import type { DecoratedMethod } from './DecoratedMethod.js';

export type StandardMetricsMethodDecorator = <
  This,
  Arguments extends unknown[],
  Result,
>(
  method: DecoratedMethod<This, Arguments, Result>,
  context: ClassMethodDecoratorContext<
    This,
    DecoratedMethod<This, Arguments, Result>
  >,
) => DecoratedMethod<This, Arguments, Result>;
