export class NonErrorThrownError extends Error {
  public constructor() {
    super('A non-Error value was thrown');
    this.name = new.target.name;
  }
}
