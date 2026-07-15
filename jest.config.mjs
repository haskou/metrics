/** @type {import('jest').Config} */
export default {
  clearMocks: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/adapters/console/ConsoleLike.ts',
    '!<rootDir>/src/adapters/prometheus/PrometheusMetricsAdapterOptions.ts',
    '!<rootDir>/src/configuration/**/*.ts',
    '!<rootDir>/src/contracts/**/*.ts',
    '!<rootDir>/src/in-memory/InMemoryLogRecord.ts',
    '!<rootDir>/src/in-memory/InMemoryMetricRecord.ts',
    '!<rootDir>/src/in-memory/MetricsInspectionSnapshot.ts',
    '!<rootDir>/src/instrumentation/DecoratedMethod.ts',
    '!<rootDir>/src/instrumentation/InstrumentationDependencies.ts',
    '!<rootDir>/src/instrumentation/InstrumentationOptions.ts',
    '!<rootDir>/src/instrumentation/LegacyMetricsMethodDecorator.ts',
    '!<rootDir>/src/instrumentation/MetricsMethodDecorator.ts',
    '!<rootDir>/src/instrumentation/StandardMetricsMethodDecorator.ts',
    '!<rootDir>/src/logging/InstrumentationLogPrimitives.ts',
    '!<rootDir>/src/metrics/MetricMeasurementPrimitives.ts',
    '!<rootDir>/src/metrics/MetricUnit.ts',
    '!<rootDir>/src/resources/ResourceUsagePrimitives.ts',
    '!<rootDir>/src/testing/RecordedIncrement.ts',
    '!<rootDir>/src/testing/RecordedObservation.ts',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  errorOnDeprecated: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            decorators: true,
            syntax: 'typescript',
          },
          target: 'es2022',
          transform: {
            decoratorMetadata: false,
            legacyDecorator: true,
          },
        },
        module: {
          type: 'es6',
        },
        sourceMaps: 'inline',
      },
    ],
  },
};
