import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '#resource-usage': fileURLToPath(
        new URL(
          '../src/adapters/system/defaultResourceUsage.ts',
          import.meta.url,
        ),
      ),
    },
  },
});
