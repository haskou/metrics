import { configureMetrics } from '../../src/instrumentation/configureMetrics.js';
import { Metrics } from '../../src/instrumentation/Metrics.js';
import { InMemoryMetricsAdapter } from '../../src/testing/InMemoryMetricsAdapter.js';
import { ManualClock } from '../../src/testing/ManualClock.js';

describe(Metrics.name, () => {
  it('instruments decorated methods', () => {
    const adapter = new InMemoryMetricsAdapter();
    const clock = new ManualClock();
    configureMetrics({ adapter, clock });

    class UserCreator {
      @Metrics()
      public create(identifier: number): number {
        clock.advance(9);

        return identifier;
      }
    }

    expect(new UserCreator().create(5)).toBe(5);
    expect(adapter.increments[0]!.operation).toBe('UserCreator.create');
    expect(adapter.observations[0]!.value).toBe(9);
  });

  it('rejects non-method targets', () => {
    expect(() => Metrics('invalid')({}, 'value', {})).toThrow(
      'Metrics can only decorate methods',
    );
    expect(() => {
      Reflect.apply(Metrics('invalid'), undefined, [{}, 'value', null]);
    }).toThrow('Metrics can only decorate methods');
    expect(() => {
      Reflect.apply(Metrics('invalid'), undefined, [{}, 'value', { value: 0 }]);
    }).toThrow('Metrics can only decorate methods');

    const decorator = Metrics('invalid');
    const standardContext = { kind: 'method' };

    expect(() => {
      Reflect.apply(decorator, undefined, [0, standardContext]);
    }).toThrow('Metrics can only decorate methods');
  });

  it.each([null, {}, { kind: 'field' }])(
    'rejects invalid decorator context %p',
    (context) => {
      expect(() => {
        Reflect.apply(Metrics('invalid'), undefined, [
          () => undefined,
          context,
        ]);
      }).toThrow('Metrics can only decorate methods');
    },
  );

  it('supports standard TypeScript decorators', () => {
    const adapter = new InMemoryMetricsAdapter();
    configureMetrics({ adapter });
    interface CalculatorReceiver {
      readonly base: number;
    }
    const original = function (
      this: CalculatorReceiver,
      value: number,
    ): number {
      return this.base + value;
    };
    const context: ClassMethodDecoratorContext<
      CalculatorReceiver,
      typeof original
    > = {
      access: {
        get: (object) => original.bind(object),
        has: (object) => 'base' in object,
      },
      addInitializer: () => undefined,
      kind: 'method',
      metadata: {},
      name: 'add',
      private: false,
      static: false,
    };
    const receiver = { base: 2 };
    Object.defineProperty(receiver, 'constructor', {
      value: function Calculator(): void {},
    });

    const decorated = Metrics()(original, context);
    const explicitlyDecorated = Metrics('numbers.add', {
      attributes: { source: 'explicit' },
    })(original, context);

    expect(decorated.call(receiver, 3)).toBe(5);
    expect(explicitlyDecorated.call(receiver, 3)).toBe(5);
    expect(adapter.increments[0]!.operation).toBe('Calculator.add');
    expect(adapter.increments[1]).toMatchObject({
      attributes: { source: 'explicit' },
      operation: 'numbers.add',
    });
  });
});
