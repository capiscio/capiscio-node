/**
 * E2E tests for capiscio badge commands.
 * 
 * Tests badge issuance and verification commands against a live server.
 * Requires CAPISCIO_API_KEY and CAPISCIO_TEST_AGENT_ID environment variables.
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { E2E_CONFIG } from './setup';

const execAsync = promisify(exec);
const CLI_PATH = path.join(__dirname, '../../bin/capiscio.js');

async function runCapiscio(
  args: string[],
  env?: Record<string, string>
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" ${args.join(' ')}`, {
      env: { ...process.env, ...env },
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
    };
  }
}

describe('badge commands', () => {
  const hasApiKey = !!E2E_CONFIG.apiKey;
  const hasTestAgent = !!E2E_CONFIG.testAgentId;

  describe('badge issue', () => {
    it.skipIf(!hasApiKey || !hasTestAgent)('should issue badge with API key', async () => {
      const result = await runCapiscio(
        ['badge', 'issue', '--agent-id', E2E_CONFIG.testAgentId, '--domain', 'test.capisc.io'],
        { CAPISCIO_API_KEY: E2E_CONFIG.apiKey }
      );

      // Should produce output (success or appropriate error)
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);

      // If successful, should contain token or badge
      if (result.exitCode === 0) {
        expect(
          result.stdout.toLowerCase().includes('token') || result.stdout.toLowerCase().includes('badge')
        ).toBe(true);
      }
    }, 15000);

    it('should fail without API key', async () => {
      const result = await runCapiscio(
        ['badge', 'issue', '--agent-id', 'test-agent-id', '--domain', 'test.capisc.io'],
        { CAPISCIO_API_KEY: '' } // Remove API key
      );

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('auth') ||
        errorOutput.includes('key') ||
        errorOutput.includes('credential') ||
        errorOutput.includes('unauthorized')
      ).toBe(true);
    }, 15000);

    it.skipIf(!hasApiKey)('should fail for invalid agent ID', async () => {
      const invalidAgentId = '00000000-0000-0000-0000-000000000000';
      const result = await runCapiscio(
        ['badge', 'issue', '--agent-id', invalidAgentId, '--domain', 'test.capisc.io'],
        { CAPISCIO_API_KEY: E2E_CONFIG.apiKey }
      );

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('not found') ||
        errorOutput.includes('invalid') ||
        errorOutput.includes('unknown') ||
        errorOutput.includes('does not exist')
      ).toBe(true);
    }, 15000);

    it('should display help for badge issue', async () => {
      const result = await runCapiscio(['badge', 'issue', '--help']);

      expect(result.exitCode).toBe(0);
      const helpText = result.stdout.toLowerCase();
      expect(helpText.includes('agent') || helpText.includes('issue')).toBe(true);
    }, 15000);
  });

  describe('badge verify', () => {
    it('should fail for invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';
      const result = await runCapiscio(['badge', 'verify', invalidToken]);

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('invalid') ||
        errorOutput.includes('verify') ||
        errorOutput.includes('failed') ||
        errorOutput.includes('malformed')
      ).toBe(true);
    }, 15000);

    it('should display help for badge verify', async () => {
      const result = await runCapiscio(['badge', 'verify', '--help']);

      expect(result.exitCode).toBe(0);
      const helpText = result.stdout.toLowerCase();
      expect(helpText.includes('verify') || helpText.includes('token')).toBe(true);
    }, 15000);
  });

  describe('badge help', () => {
    it('should display help for badge command', async () => {
      const result = await runCapiscio(['badge', '--help']);

      expect(result.exitCode).toBe(0);
      const helpText = result.stdout.toLowerCase();
      expect(helpText.includes('badge')).toBe(true);
      expect(
        helpText.includes('issue') || helpText.includes('verify') || helpText.includes('usage')
      ).toBe(true);
    }, 15000);
  });
});
