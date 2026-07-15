import type { DecoratedMethod } from './DecoratedMethod.js';

export type LegacyMetricsMethodDecorator = <
  This,
  Arguments extends unknown[],
  Result,
>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<DecoratedMethod<This, Arguments, Result>>,
) => void;
