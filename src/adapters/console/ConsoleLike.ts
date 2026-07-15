export interface ConsoleLike {
  error(message: string, context?: object): void;
  log(message: string, context?: object): void;
}
