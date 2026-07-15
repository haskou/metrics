export class InvalidMetricsDecoratorTargetError extends TypeError {
  public constructor() {
    super('Metrics can only decorate methods');
    this.name = new.target.name;
  }
}
