import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

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

for (const entrypoint of [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/testing/index.js',
  'dist/adapters/console/index.js',
  'dist/adapters/node/index.js',
  'dist/adapters/prometheus/index.js',
  'dist/configuration/index.js',
  'dist/configuration/index.cjs',
  'dist/configuration/index.d.ts',
  'dist/instrumentation/index.js',
  'dist/instrumentation/index.cjs',
  'dist/instrumentation/index.d.ts',
]) {
  assert.ok(files.includes(entrypoint), `Package file missing: ${entrypoint}`);
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
