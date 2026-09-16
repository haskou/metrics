import type { MetricsPort } from '@haskou/metrics/contracts';

import { MetricsInstrumenter, measure } from '@haskou/metrics';
import { InMemoryMetricsAdapter } from '@haskou/metrics/testing';

export const adapter: MetricsPort = new InMemoryMetricsAdapter();
export const instrumenter = new MetricsInstrumenter({ adapter });
const result: number = measure('commonjs', () =>
  instrumenter.measure('nested', () => 42),
);
void result;
