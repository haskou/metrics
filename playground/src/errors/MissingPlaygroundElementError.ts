export class MissingPlaygroundElementError extends Error {
  public constructor(identifier: string) {
    super(`Missing playground element: ${identifier}`);
    this.name = new.target.name;
  }
}
