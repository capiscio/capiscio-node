import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import { Readable } from 'stream';

// Mock stream pipeline
vi.mock('stream', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    default: {
      ...actual.default,
      pipeline: (source: any, dest: any, cb: any) => {
        if (cb) cb(null);
        return { on: vi.fn() };
      },
    },
    pipeline: (source: any, dest: any, cb: any) => {
      if (cb) cb(null);
      return { on: vi.fn() };
    },
  };
});

vi.mock('fs');
vi.mock('axios');
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  })),
}));

function resetBinaryManager() {
  vi.resetModules();
}

/**
 * Helper: create a mock readable stream that emits the given data buffer
 * and connects to crypto.createHash correctly via the 'data'/'end' event pattern.
 */
function mockReadStream(data: Buffer): fs.ReadStream {
  const readable = new Readable({
    read() {
      this.push(data);
      this.push(null);
    },
  });
  return readable as unknown as fs.ReadStream;
}

describe('Checksum verification', () => {
  const KNOWN_CONTENT = Buffer.from('test binary content');
  // Pre-computed SHA-256 of KNOWN_CONTENT
  let KNOWN_HASH: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetBinaryManager();

    // Compute expected hash dynamically so we don't hardcode
    const crypto = await import('crypto');
    KNOWN_HASH = crypto.createHash('sha256').update(KNOWN_CONTENT).digest('hex');

    // Default fs mocks
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p);
      if (s.includes('capiscio-core') && !s.includes('package.json')) return false;
      return s.includes('package.json');
    });
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.mkdtempSync).mockReturnValue('/tmp/capiscio-test');
    vi.mocked(fs.createWriteStream).mockReturnValue({
      on: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    } as any);
    vi.mocked(fs.copyFileSync).mockReturnValue(undefined);
    vi.mocked(fs.chmodSync).mockReturnValue(undefined);
    vi.mocked(fs.rmSync).mockReturnValue(undefined);

    vi.spyOn(os, 'platform').mockReturnValue('linux');
    vi.spyOn(os, 'arch').mockReturnValue('x64');

    delete process.env.CAPISCIO_SKIP_CHECKSUM;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CAPISCIO_SKIP_CHECKSUM;
  });

  /**
   * Helper to set up axios mocks for download + checksum flow.
   * @param checksumResponse - resolved value for checksums.txt GET, or Error to reject
   * @param fileContent - buffer to serve as the downloaded binary content
   */
  async function setupMocks(
    checksumResponse: { data: string } | Error,
    fileContent: Buffer = KNOWN_CONTENT,
  ) {
    const axios = await import('axios');

    const downloadStream: any = {
      pipe: vi.fn().mockReturnThis(),
      on: vi.fn((event, cb) => {
        if (event === 'end') cb();
        return downloadStream;
      }),
      once: vi.fn(),
      emit: vi.fn(),
    };

    // First call = binary download, second call = checksums.txt
    vi.mocked(axios.default.get).mockImplementation((url: string) => {
      if (url.includes('checksums.txt')) {
        if (checksumResponse instanceof Error) {
          return Promise.reject(checksumResponse);
        }
        return Promise.resolve(checksumResponse);
      }
      // Binary download
      return Promise.resolve({ data: downloadStream });
    });

    // Mock createReadStream to return a stream of the file content
    vi.mocked(fs.createReadStream).mockReturnValue(mockReadStream(fileContent));

    return axios;
  }

  it('should pass when checksum matches', async () => {
    const assetName = 'capiscio-linux-amd64';
    await setupMocks({
      data: `${KNOWN_HASH}  ${assetName}\n`,
    });

    const { BinaryManager } = await import('../../src/utils/binary-manager');
    const instance = BinaryManager.getInstance();

    // Should not throw — checksum matches
    await expect(instance.getBinaryPath()).resolves.toBeDefined();
    // rmSync is called once for temp dir cleanup (recursive), but never for the
    // downloaded file alone (non-recursive force-only), which is the mismatch path.
    const rmCalls = vi.mocked(fs.rmSync).mock.calls;
    const fileDeleteCalls = rmCalls.filter(
      ([, opts]) => opts && typeof opts === 'object' && !('recursive' in opts),
    );
    expect(fileDeleteCalls).toHaveLength(0);
  });

  it('should throw and delete file when checksum mismatches', async () => {
    const assetName = 'capiscio-linux-amd64';
    await setupMocks({
      data: `deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef  ${assetName}\n`,
    });

    const { BinaryManager } = await import('../../src/utils/binary-manager');
    const instance = BinaryManager.getInstance();

    await expect(instance.getBinaryPath()).rejects.toThrow('Binary integrity check failed');
    // Tampered file should be removed with force
    expect(fs.rmSync).toHaveBeenCalledWith(
      expect.stringContaining('capiscio'),
      { force: true },
    );
  });

  it('should throw when checksums.txt fetch fails (fail-closed default)', async () => {
    await setupMocks(new Error('Network error'));

    const { BinaryManager } = await import('../../src/utils/binary-manager');
    const instance = BinaryManager.getInstance();

    await expect(instance.getBinaryPath()).rejects.toThrow(
      'Checksum verification failed',
    );
    expect(fs.rmSync).toHaveBeenCalledWith(
      expect.stringContaining('capiscio'),
      { force: true },
    );
  });

  it('should skip verification when checksums.txt fetch fails and CAPISCIO_SKIP_CHECKSUM=true', async () => {
    process.env.CAPISCIO_SKIP_CHECKSUM = 'true';
    await setupMocks(new Error('Network error'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { BinaryManager } = await import('../../src/utils/binary-manager');
    const instance = BinaryManager.getInstance();

    await expect(instance.getBinaryPath()).resolves.toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not fetch checksums.txt'));
    warnSpy.mockRestore();
  });

  it('should throw when asset not found in checksums.txt (fail-closed default)', async () => {
    // checksums.txt exists but does not contain our asset
    await setupMocks({
      data: 'abc123  some-other-asset\n',
    });

    const { BinaryManager } = await import('../../src/utils/binary-manager');
    const instance = BinaryManager.getInstance();

    await expect(instance.getBinaryPath()).rejects.toThrow(
      'not found in checksums.txt',
    );
    expect(fs.rmSync).toHaveBeenCalledWith(
      expect.stringContaining('capiscio'),
      { force: true },
    );
  });

  it('should skip verification when asset not found in checksums.txt and CAPISCIO_SKIP_CHECKSUM=true', async () => {
    process.env.CAPISCIO_SKIP_CHECKSUM = 'true';
    await setupMocks({
      data: 'abc123  some-other-asset\n',
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { BinaryManager } = await import('../../src/utils/binary-manager');
    const instance = BinaryManager.getInstance();

    await expect(instance.getBinaryPath()).resolves.toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found in checksums.txt'));
    warnSpy.mockRestore();
  });

  it('should accept CAPISCIO_SKIP_CHECKSUM values: 1, yes, TRUE', async () => {
    for (const val of ['1', 'yes', 'TRUE']) {
      resetBinaryManager();
      vi.clearAllMocks();

      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const s = String(p);
        if (s.includes('capiscio-core') && !s.includes('package.json')) return false;
        return s.includes('package.json');
      });
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      vi.mocked(fs.mkdtempSync).mockReturnValue('/tmp/capiscio-test');
      vi.mocked(fs.createWriteStream).mockReturnValue({
        on: vi.fn(), once: vi.fn(), emit: vi.fn(), write: vi.fn(), end: vi.fn(),
      } as any);
      vi.mocked(fs.copyFileSync).mockReturnValue(undefined);
      vi.mocked(fs.chmodSync).mockReturnValue(undefined);
      vi.mocked(fs.rmSync).mockReturnValue(undefined);
      vi.spyOn(os, 'platform').mockReturnValue('linux');
      vi.spyOn(os, 'arch').mockReturnValue('x64');

      process.env.CAPISCIO_SKIP_CHECKSUM = val;
      await setupMocks(new Error('fetch failed'));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { BinaryManager } = await import('../../src/utils/binary-manager');
      const instance = BinaryManager.getInstance();

      await expect(instance.getBinaryPath()).resolves.toBeDefined();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not fetch checksums.txt'));
      warnSpy.mockRestore();
    }
  });
});
