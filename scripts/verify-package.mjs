import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const entrypoints = [
  '@haskou/metrics',
  '@haskou/metrics/testing',
  '@haskou/metrics/adapters/console',
  '@haskou/metrics/adapters/node',
  '@haskou/metrics/adapters/prometheus',
  '@haskou/metrics/configuration',
  '@haskou/metrics/contracts',
  '@haskou/metrics/instrumentation',
  '@haskou/metrics/model',
];

const require = createRequire(import.meta.url);

const esm = await import('@haskou/metrics');
const cjs = require('@haskou/metrics');
const instrumentation = await import('@haskou/metrics/instrumentation');
const cjsInstrumentation = require('@haskou/metrics/instrumentation');
assert.equal(
  esm.MetricsInstrumenter,
  cjs.MetricsInstrumenter,
  'ESM and CJS must share class identity',
);
assert.equal(
  esm.metrics,
  instrumentation.metrics,
  'ESM subpaths must share the inspector',
);
assert.equal(
  esm.metrics,
  cjsInstrumentation.metrics,
  'CJS subpaths must share the inspector',
);
esm.metrics.clear();
esm.measure('package.shared', () => 42, { recordDuration: false });
assert.equal(cjs.metrics.snapshot().metrics[0].name, 'package.shared.calls');
const { InMemoryMetricsAdapter } = require('@haskou/metrics/testing');
const adapter = new InMemoryMetricsAdapter();
const restore = cjs.configureMetrics({ adapter });
instrumentation.measure('package.configured', () => 42, {
  recordDuration: false,
});
assert.equal(adapter.increments[0].name, 'package.configured.calls');
restore();
esm.metrics.clear();
esm.measure('package.automatic', () => 42, {
  recordCpu: true,
  recordMemory: true,
  recordDuration: false,
});
assert.equal(
  esm.metrics.snapshot().metrics.length,
  7,
  'Node sampling must work without configuration',
);
esm.metrics.clear();
const automaticResources = new InMemoryMetricsAdapter();
new cjs.MetricsInstrumenter({ adapter: automaticResources }).measure(
  'package.automatic.instance',
  () => 42,
  {
    recordCpu: true,
    recordMemory: true,
    recordDuration: false,
  },
);
assert.equal(
  automaticResources.observations.length,
  6,
  'Constructed Node instrumenters must sample automatically',
);
const { NodeResourceUsageAdapter } =
  await import('@haskou/metrics/adapters/node');
const resources = new InMemoryMetricsAdapter();
new esm.MetricsInstrumenter({
  adapter: resources,
  resourceUsage: new NodeResourceUsageAdapter(),
}).measure('package.node', () => 42, {
  recordCpu: true,
  recordMemory: true,
  recordDuration: false,
});
assert.equal(
  resources.observations.length,
  6,
  'Explicit Node adapter must record resources',
);
assert.ok(
  resources.observations.every((record) => Number.isFinite(record.value)),
);

const { ManualResourceUsageAdapter } = require('@haskou/metrics/testing');
const customResources = new ManualResourceUsageAdapter();
const customMeasurements = new InMemoryMetricsAdapter();
const restoreCustom = esm.configureMetrics({
  adapter: customMeasurements,
  resourceUsage: customResources,
});
cjs.measure(
  'package.custom',
  () =>
    customResources.set({
      cpuUserMicroseconds: 123,
      cpuSystemMicroseconds: 456,
      residentSetBytes: 789,
      heapUsedBytes: 100,
    }),
  { recordCpu: true, recordMemory: true, recordDuration: false },
);
assert.equal(
  customMeasurements.observations.find((record) => record.kind === 'cpu.user')
    .value,
  123,
);
restoreCustom();
instrumentation.resetMetrics();
cjsInstrumentation.measure('package.reset', () => 42, {
  recordMemory: true,
  recordDuration: false,
});
assert.equal(
  esm.metrics.snapshot().metrics.length,
  5,
  'Reset must preserve automatic Node sampling',
);
esm.metrics.clear();

for (const entrypoint of entrypoints) {
  assert.ok(await import(entrypoint), `ESM entrypoint failed: ${entrypoint}`);
  assert.ok(require(entrypoint), `CommonJS entrypoint failed: ${entrypoint}`);
}

const packResult = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], {
    encoding: 'utf8',
  }),
);
const files = packResult[0].files.map(({ path }) => path);

const manifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
for (const target of Object.values(manifest.imports['#resource-usage'])) {
  assert.ok(
    files.includes(target.slice(2)),
    `Runtime integration missing: ${target}`,
  );
}
for (const entry of Object.values(manifest.exports)) {
  if (typeof entry === 'string') continue;
  for (const target of [
    entry.import.default,
    entry.import.types,
    entry.require.default,
    entry.require.types,
    entry.node.import.default,
    entry.node.import.types,
  ]) {
    assert.ok(
      files.includes(target.slice(2)),
      `Package file missing: ${target}`,
    );
  }
}

assert.equal(
  files.some((path) => path.startsWith('src/')),
  false,
);
assert.equal(
  files.some((path) => path.startsWith('tests/')),
  false,
);

process.stdout.write('Package exports and contents verified.\n');
