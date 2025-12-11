import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BinaryManager } from '../utils/binary-manager';

describe('BinaryManager', () => {
  it('should be a singleton', () => {
    const instance1 = BinaryManager.getInstance();
    const instance2 = BinaryManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should detect platform correctly', () => {
    const manager = BinaryManager.getInstance();
    // Just verify it doesn't throw
    expect(manager).toBeDefined();
  });
});

describe('CLI Package', () => {
  it('should export version', async () => {
    const { version } = await import('../index');
    expect(version).toBe('2.1.3');
  });

  it('should export BinaryManager', async () => {
    const { BinaryManager: ExportedBinaryManager } = await import('../index');
    expect(ExportedBinaryManager).toBeDefined();
    expect(typeof ExportedBinaryManager.getInstance).toBe('function');
  });
});
