import { jest } from '@jest/globals';

import { MetricsInstrumenter } from '../../src/instrumentation/MetricsInstrumenter.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';
import { ManualClock } from '../../src/testing/ManualClock.js';

describe(MetricsInstrumenter.name, () => {
  it('measures synchronous success and failure', () => {
    const adapter = new InMemoryMetricsAdapter();
    const clock = new ManualClock();
    const instrumenter = new MetricsInstrumenter({ adapter, clock });

    expect(
      instrumenter.measure('success', () => {
        clock.advance(2);

        return 'ok';
      }),
    ).toBe('ok');
    expect(() =>
      instrumenter.measure('failure', () => {
        throw new Error('failed');
      }),
    ).toThrow('failed');
  });

  it('measures asynchronous success and failure', async () => {
    const adapter = new InMemoryMetricsAdapter();
    const instrumenter = new MetricsInstrumenter({ adapter });

    await expect(
      instrumenter.measure('success', () => Promise.resolve('ok')),
    ).resolves.toBe('ok');
    await expect(
      instrumenter.measure('failure', () =>
        Promise.reject(new Error('failed')),
      ),
    ).rejects.toThrow('failed');
  });

  it('supports callable promise-like results and null', async () => {
    const adapter = new InMemoryMetricsAdapter();
    const instrumenter = new MetricsInstrumenter({ adapter });
    const thenable = Object.assign(() => undefined, {
      then(resolve: (value: string) => void): void {
        resolve('resolved');
      },
    });

    await expect(
      instrumenter.measure('thenable', () => thenable),
    ).resolves.toBe('resolved');
    expect(instrumenter.measure('null', () => null)).toBeNull();
  });

  it('preserves synchronous objects with a non-callable then property', () => {
    const instrumenter = new MetricsInstrumenter({
      adapter: new InMemoryMetricsAdapter(),
    });
    const result = { then: 123, value: 'sync' };

    expect(instrumenter.measure('sync', () => result)).toBe(result);
  });

  it('formats names, prefixes, and global attributes', () => {
    const adapter = new InMemoryMetricsAdapter();
    const instrumenter = new MetricsInstrumenter({
      adapter,
      attributes: { service: 'api' },
      nameFormatter: (operation, kind) => `${operation}_${kind}`,
      prefix: 'production',
    });

    instrumenter.measure('users.create', () => undefined, {
      recordDuration: false,
    });

    expect(adapter.increments[0]).toEqual({
      attributes: { service: 'api' },
      kind: 'calls',
      name: 'production.users.create_calls',
      operation: 'users.create',
      unit: 'count',
      value: 1,
    });
  });

  it('creates functions that preserve arguments and this binding', () => {
    const instrumenter = new MetricsInstrumenter({
      adapter: new InMemoryMetricsAdapter(),
    });
    const owner = {
      add: instrumenter.instrument(
        'numbers.add',
        function (this: { base: number }, value: number) {
          return this.base + value;
        },
      ),
      base: 2,
    };

    expect(owner.add(3)).toBe(5);
  });

  it('runs operations without instrumentation when disabled', () => {
    const operation = jest.fn(() => 'ok');

    expect(MetricsInstrumenter.disabled().measure('disabled', operation)).toBe(
      'ok',
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
