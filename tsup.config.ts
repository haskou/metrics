import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    'adapters/console/index': 'src/adapters/console/index.ts',
    'adapters/node/index': 'src/adapters/node/index.ts',
    'adapters/prometheus/index': 'src/adapters/prometheus/index.ts',
    'testing/index': 'src/testing/index.ts',
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  sourcemap: true,
  splitting: false,
  target: 'es2022',
});
