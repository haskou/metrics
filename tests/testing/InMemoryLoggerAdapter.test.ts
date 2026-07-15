import { InstrumentationLog } from '../../src/logging/InstrumentationLog.js';
import { InMemoryLoggerAdapter } from '../../src/testing/InMemoryLoggerAdapter.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(InMemoryLoggerAdapter.name, () => {
  it('records and clears serialized logs', () => {
    const adapter = new InMemoryLoggerAdapter();
    adapter.write(
      InstrumentationLog.called(new OperationName('users.create'), {}),
    );

    expect(adapter.entries[0]!.message).toBe('users.create called');

    adapter.clear();

    expect(adapter.entries).toEqual([]);
  });
});
