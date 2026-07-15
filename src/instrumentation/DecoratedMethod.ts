export type DecoratedMethod<This, Arguments extends unknown[], Result> = (
  this: This,
  ...arguments_: Arguments
) => Result;
