import { defaultResourceUsage } from '../../../src/adapters/node/defaultResourceUsage.js';
import { NodeResourceUsageAdapter } from '../../../src/adapters/node/NodeResourceUsageAdapter.js';

describe('Node resource defaults', () => {
  it('provides the native resource adapter', () => {
    expect(defaultResourceUsage).toBeInstanceOf(NodeResourceUsageAdapter);
  });
});
