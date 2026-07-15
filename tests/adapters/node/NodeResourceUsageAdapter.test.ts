import { NodeResourceUsageAdapter } from '../../../src/adapters/node/NodeResourceUsageAdapter.js';

describe(NodeResourceUsageAdapter.name, () => {
  it('captures the current Node process resources', () => {
    const snapshot = new NodeResourceUsageAdapter().capture();

    expect(snapshot.getResidentSet().isGreaterThan(0)).toBe(true);
    expect(snapshot.getHeapUsed().isGreaterThan(0)).toBe(true);
  });
});
