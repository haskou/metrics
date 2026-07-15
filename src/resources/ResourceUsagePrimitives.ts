export interface ResourceUsagePrimitives {
  readonly cpuSystemMicroseconds: number;
  readonly cpuUserMicroseconds: number;
  readonly heapUsedBytes: number;
  readonly residentSetBytes: number;
}
