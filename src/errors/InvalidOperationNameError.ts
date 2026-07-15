export class InvalidOperationNameError extends Error {
  public constructor() {
    super('Metric operation name cannot be empty');
    this.name = new.target.name;
  }
}
