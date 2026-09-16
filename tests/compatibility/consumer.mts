import type { MetricsPort } from '@haskou/metrics/contracts';

import { MetricsInstrumenter, measure } from '@haskou/metrics';
import { InMemoryMetricsAdapter } from '@haskou/metrics/testing';

import {
  adapter as commonjsAdapter,
  instrumenter as commonjsInstrumenter,
} from './consumer.cjs';

const adapter: MetricsPort = new InMemoryMetricsAdapter();
const instrumenter = new MetricsInstrumenter({ adapter });
const result: number = measure('esm', () =>
  instrumenter.measure('nested', () => 42),
);
void result;

const sharedAdapter: MetricsPort = commonjsAdapter;
const sharedInstrumenter: MetricsInstrumenter = commonjsInstrumenter;
void sharedAdapter;
void sharedInstrumenter;
