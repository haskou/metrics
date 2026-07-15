export class DecoratorOperationName {
  private static className(receiver: unknown): string {
    if (typeof receiver === 'function') {
      return receiver.name || 'Anonymous';
    }

    if (typeof receiver === 'object' && receiver !== null) {
      return receiver.constructor.name || 'Anonymous';
    }

    return 'Anonymous';
  }

  private static methodName(method: string | symbol): string {
    return typeof method === 'symbol'
      ? method.description || method.toString()
      : method;
  }

  public static fromLegacy(
    explicitName: string | undefined,
    target: object,
    method: string | symbol,
  ): string {
    return (
      explicitName ??
      `${DecoratorOperationName.className(target)}.${DecoratorOperationName.methodName(method)}`
    );
  }

  public static fromStandard(
    explicitName: string | undefined,
    receiver: unknown,
    method: string | symbol,
  ): string {
    return (
      explicitName ??
      `${DecoratorOperationName.className(receiver)}.${DecoratorOperationName.methodName(method)}`
    );
  }
}
