# Installation

```bash
npm install @haskou/metrics
```

Or with Yarn:

```bash
yarn add @haskou/metrics
```

The package supports Node.js 22 and newer and ships ESM, CommonJS, source
maps, and TypeScript declarations.

`@Metrics` supports standard TypeScript decorators without additional compiler
flags. For projects that still use legacy decorators, enable:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Optional integrations keep their vendor packages outside the core install:

- [Prometheus and Grafana](/integrations/prometheus) uses `prom-client`.
- [Winston](/integrations/winston) uses `winston` through `LoggerPort`.
