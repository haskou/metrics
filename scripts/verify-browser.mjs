import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { build } from 'vite';

const [result] = await build({
  configFile: false,
  logLevel: 'error',
  build: {
    write: false,
    minify: false,
    lib: {
      entry: 'tests/compatibility/browser.ts',
      formats: ['iife'],
      name: 'MetricsCompatibility',
    },
  },
});
const chunk = result.output.find((output) => output.type === 'chunk');
assert.ok(chunk, 'Browser bundle must exist');
// No process, Buffer, require, or Node built-ins in this environment.
const context = { performance: { now: () => 1 }, console };
runInNewContext(chunk.code, context);
await context.MetricsCompatibility.verify();
process.stdout.write('Browser bundle works without Node globals.\n');
