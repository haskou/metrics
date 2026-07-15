import { DecoratorOperationName } from '../../src/instrumentation/DecoratorOperationName.js';

describe(DecoratorOperationName.name, () => {
  class UserCreator {}

  it('infers legacy instance and static method names', () => {
    expect(
      DecoratorOperationName.fromLegacy(
        undefined,
        UserCreator.prototype,
        'create',
      ),
    ).toBe('UserCreator.create');
    expect(
      DecoratorOperationName.fromLegacy(undefined, UserCreator, 'from'),
    ).toBe('UserCreator.from');
  });

  it('infers standard names from receivers and symbols', () => {
    expect(
      DecoratorOperationName.fromStandard(
        undefined,
        new UserCreator(),
        Symbol('create'),
      ),
    ).toBe('UserCreator.create');
    expect(
      DecoratorOperationName.fromStandard(undefined, UserCreator, Symbol()),
    ).toBe('UserCreator.Symbol()');
  });

  it('uses an explicit name and handles receivers without a class name', () => {
    const anonymous = function (): void {};
    Object.defineProperty(anonymous, 'name', { value: '' });
    const anonymousInstance = { constructor: anonymous };

    expect(
      DecoratorOperationName.fromLegacy(
        'users.create',
        UserCreator.prototype,
        'ignored',
      ),
    ).toBe('users.create');
    expect(
      DecoratorOperationName.fromStandard(undefined, anonymous, 'create'),
    ).toBe('Anonymous.create');
    expect(
      DecoratorOperationName.fromStandard(
        undefined,
        anonymousInstance,
        'create',
      ),
    ).toBe('Anonymous.create');
    expect(
      DecoratorOperationName.fromStandard(undefined, undefined, 'create'),
    ).toBe('Anonymous.create');
  });
});
