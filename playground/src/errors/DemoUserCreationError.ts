export class DemoUserCreationError extends Error {
  public constructor() {
    super('The demo user could not be created');
    this.name = new.target.name;
  }
}
