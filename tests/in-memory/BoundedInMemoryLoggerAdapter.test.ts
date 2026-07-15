import { BoundedInMemoryLoggerAdapter } from '../../src/in-memory/BoundedInMemoryLoggerAdapter.js';
import { InstrumentationLog } from '../../src/logging/InstrumentationLog.js';
import { OperationName } from '../../src/values/OperationName.js';

describe(BoundedInMemoryLoggerAdapter.name, () => {
  it('keeps recent logs within its capacity', () => {
    const adapter = new BoundedInMemoryLoggerAdapter(1);
    const operation = new OperationName('users.create');

    adapter.write(InstrumentationLog.called(operation, {}));
    adapter.write(
      InstrumentationLog.failed(operation, {}, new Error('failed'), false),
    );

    expect(adapter.getCapacity()).toBe(1);
    expect(adapter.getDiscarded()).toBe(1);
    expect(adapter.snapshot()[0]!.message).toBe('users.create failed');
  });

  it('clears stored logs and discarded count', () => {
    const adapter = new BoundedInMemoryLoggerAdapter(1);
    adapter.write(
      InstrumentationLog.called(new OperationName('users.create'), {}),
    );

    adapter.clear();

    expect(adapter.snapshot()).toEqual([]);
    expect(adapter.getDiscarded()).toBe(0);
  });
});
