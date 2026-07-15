export class InvalidBufferCapacityError extends Error {
  public constructor() {
    super('In-memory capacity must be an integer greater than zero');
    this.name = new.target.name;
  }
}
