import { jest } from '@jest/globals';

import type { ConsoleLike } from '../../../src/adapters/console/ConsoleLike.js';

import { ConsoleLoggerAdapter } from '../../../src/adapters/console/ConsoleLoggerAdapter.js';
import { InstrumentationLog } from '../../../src/logging/InstrumentationLog.js';
import { OperationName } from '../../../src/values/OperationName.js';

describe(ConsoleLoggerAdapter.name, () => {
  it('routes called and failed logs to the matching console method', () => {
    const console: jest.Mocked<ConsoleLike> = {
      error: jest.fn(),
      log: jest.fn(),
    };
    const adapter = new ConsoleLoggerAdapter(console);
    const operation = new OperationName('users.create');

    adapter.write(InstrumentationLog.called(operation, {}));
    adapter.write(
      InstrumentationLog.failed(operation, {}, new Error('failed'), true),
    );

    expect(console.log).toHaveBeenCalledWith(
      'users.create called',
      expect.objectContaining({ level: 'called' }),
    );
    expect(console.error).toHaveBeenCalledWith(
      'users.create failed',
      expect.objectContaining({ level: 'failed' }),
    );
  });
});
