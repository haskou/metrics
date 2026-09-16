# Installation

```bash
npm install @haskou/metrics
```

Or with Yarn:

```bash
yarn add @haskou/metrics
```

The core requires ES2022 and `performance.now()` (or a supplied `ClockPort`).
The package does not declare a Node.js version range; this does not promise
support for every historical Node.js release. It ships ESM, CommonJS, source
maps, and declarations for both module formats. Node imports and requires share one runtime across public
entrypoints; browser bundlers select native ESM.

Compatibility checks cover Node.js 22, 24 and 26 and a browser bundle executed
without Node globals. Other runtimes are not yet verified. Repository development
uses Node.js 24.18.0 independently of consumer requirements.

Node.js selects CPU and memory sampling automatically when the corresponding
options are enabled. Browsers omit these measurements. You can supply a custom
`resourceUsage` adapter when needed. The Prometheus integration is Node-specific.

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
