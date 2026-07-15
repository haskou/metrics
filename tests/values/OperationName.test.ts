import { InvalidOperationNameError } from '../../src/errors/InvalidOperationNameError.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(OperationName.name, () => {
  it('adds an optional prefix', () => {
    const operation = new OperationName('users.create');

    expect(
      operation
        .prefixedBy('production')
        .isEqual(new OperationName('production.users.create')),
    ).toBe(true);
    expect(operation.prefixedBy()).toBe(operation);
  });

  it('rejects blank names', () => {
    expect(() => new OperationName('   ')).toThrow(InvalidOperationNameError);
  });
});
