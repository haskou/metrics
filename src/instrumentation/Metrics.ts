import type { InstrumentationOptions } from './InstrumentationOptions.js';
import type { MetricsMethodDecorator } from './MetricsMethodDecorator.js';

import { InvalidMetricsDecoratorTargetError } from '../errors/index.js';
import { DecoratorOperationName } from './DecoratorOperationName.js';
import { instrumentFunction, measure } from './measure.js';

type AnyMethod = (this: unknown, ...arguments_: unknown[]) => unknown;

function isStandardMethodDecorator(
  context: unknown,
): context is ClassMethodDecoratorContext<unknown, AnyMethod> {
  return (
    typeof context === 'object' &&
    context !== null &&
    'kind' in context &&
    context.kind === 'method'
  );
}

function isLegacyMethodDescriptor(
  descriptor: unknown,
): descriptor is { value: AnyMethod } {
  return (
    typeof descriptor === 'object' &&
    descriptor !== null &&
    'value' in descriptor &&
    typeof descriptor.value === 'function'
  );
}

/** TypeScript method decorator for synchronous and asynchronous methods. */
export function Metrics(
  name?: string,
  options: InstrumentationOptions = {},
): MetricsMethodDecorator {
  return ((first: unknown, second: unknown, descriptor?: unknown) => {
    if (isStandardMethodDecorator(second)) {
      if (typeof first !== 'function') {
        throw new InvalidMetricsDecoratorTargetError();
      }

      const method = first as AnyMethod;

      if (name) {
        return instrumentFunction(name, method, options);
      }

      const methodName = second.name;

      return function inferredMetricName(
        this: unknown,
        ...arguments_: unknown[]
      ): unknown {
        return measure(
          DecoratorOperationName.fromStandard(undefined, this, methodName),
          () => method.apply(this, arguments_),
          options,
        );
      };
    }

    if (!isLegacyMethodDescriptor(descriptor)) {
      throw new InvalidMetricsDecoratorTargetError();
    }

    const original = descriptor.value;
    const methodDescriptor = descriptor;
    methodDescriptor.value = instrumentFunction(
      DecoratorOperationName.fromLegacy(
        name,
        first as object,
        second as string | symbol,
      ),
      original,
      options,
    );
  }) as MetricsMethodDecorator;
}
