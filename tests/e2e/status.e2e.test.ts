/**
 * E2E tests for capiscio status commands.
 * 
 * Tests agent and badge status check commands against a live server.
 * Requires CAPISCIO_TEST_AGENT_ID environment variable.
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { randomUUID } from 'crypto';
import { E2E_CONFIG } from './setup';

const execAsync = promisify(exec);
const CLI_PATH = path.join(__dirname, '../../bin/capiscio.js');

async function runCapiscio(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" ${args.join(' ')}`);
    return { stdout, stderr, exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
    };
  }
}

describe('status commands', () => {
  const hasTestAgent = !!E2E_CONFIG.testAgentId;

  describe('agent status', () => {
    it.skipIf(!hasTestAgent)('should check status of valid agent', async () => {
      const result = await runCapiscio(['agent', 'status', E2E_CONFIG.testAgentId]);

      expect(result.exitCode).toBe(0);
      const output = result.stdout.toLowerCase();
      expect(
        output.includes('status') ||
        output.includes('active') ||
        output.includes('enabled') ||
        output.includes('disabled')
      ).toBe(true);
    }, 15000);

    it('should fail for nonexistent agent', async () => {
      const invalidAgentId = randomUUID();
      const result = await runCapiscio(['agent', 'status', invalidAgentId]);

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('not found') ||
        errorOutput.includes('unknown') ||
        errorOutput.includes('does not exist')
      ).toBe(true);
    }, 15000);

    it('should fail for malformed agent ID', async () => {
      const malformedId = 'not-a-valid-uuid';
      const result = await runCapiscio(['agent', 'status', malformedId]);

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('invalid') || errorOutput.includes('malformed') || errorOutput.includes('uuid')
      ).toBe(true);
    }, 15000);

    it.skipIf(!hasTestAgent)('should support JSON output', async () => {
      const result = await runCapiscio(['agent', 'status', E2E_CONFIG.testAgentId, '--output', 'json']);

      expect(result.exitCode).toBe(0);
      
      // Verify output is valid JSON with status information
      expect(() => JSON.parse(result.stdout)).not.toThrow();
      const output = JSON.parse(result.stdout);
      expect(typeof output).toBe('object');
      expect(
        output.status !== undefined ||
        output.active !== undefined ||
        output.enabled !== undefined ||
        output.state !== undefined
      ).toBe(true);
    }, 15000);

    it('should display help for agent status', async () => {
      const result = await runCapiscio(['agent', 'status', '--help']);

      expect(result.exitCode).toBe(0);
      const helpText = result.stdout.toLowerCase();
      expect(helpText.includes('status') || helpText.includes('agent')).toBe(true);
    }, 15000);
  });

  describe('badge status', () => {
    it('should fail for nonexistent badge', async () => {
      const nonexistentJti = randomUUID();
      const result = await runCapiscio(['badge', 'status', nonexistentJti]);

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('not found') ||
        errorOutput.includes('unknown') ||
        errorOutput.includes('does not exist')
      ).toBe(true);
    }, 15000);

    it('should fail for malformed JTI', async () => {
      const malformedJti = 'not-a-valid-jti';
      const result = await runCapiscio(['badge', 'status', malformedJti]);

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('invalid') || errorOutput.includes('malformed') || errorOutput.includes('uuid')
      ).toBe(true);
    }, 15000);

    it('should display help for badge status', async () => {
      const result = await runCapiscio(['badge', 'status', '--help']);

      expect(result.exitCode).toBe(0);
      const helpText = result.stdout.toLowerCase();
      expect(helpText.includes('status') || helpText.includes('badge') || helpText.includes('jti')).toBe(true);
    }, 15000);
  });
});
