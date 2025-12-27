/**
 * E2E tests for capiscio score command.
 * 
 * Tests the score command against a live server, verifying trust score
 * calculation for agent cards.
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
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

describe('score command', () => {
  const validCardPath = path.join(E2E_CONFIG.fixturesDir, 'valid-agent-card.json');
  const invalidCardPath = path.join(E2E_CONFIG.fixturesDir, 'invalid-agent-card.json');
  const nonexistentPath = path.join(E2E_CONFIG.fixturesDir, 'does-not-exist.json');

  it('should score a valid local agent card', async () => {
    const result = await runCapiscio(['score', validCardPath]);

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toLowerCase();
    expect(
      output.includes('score') || output.includes('trust') || /\d/.test(result.stdout)
    ).toBe(true);
  }, 15000);

  it('should handle invalid agent card appropriately', async () => {
    const result = await runCapiscio(['score', invalidCardPath]);

    // Either fails or returns low score
    if (result.exitCode !== 0) {
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('invalid') || errorOutput.includes('error')
      ).toBe(true);
    } else {
      expect(result.stdout.length).toBeGreaterThan(0);
    }
  }, 15000);

  it('should support JSON output format', async () => {
    const result = await runCapiscio(['score', validCardPath, '--output', 'json']);

    expect(result.exitCode).toBe(0);
    
    // Verify output is valid JSON with score information
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    const output = JSON.parse(result.stdout);
    expect(typeof output).toBe('object');
    expect(
      output.score !== undefined ||
      output.trust_score !== undefined ||
      output.trustScore !== undefined ||
      output.level !== undefined
    ).toBe(true);
  }, 15000);

  it('should fail for nonexistent file', async () => {
    const result = await runCapiscio(['score', nonexistentPath]);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('not found') || errorOutput.includes('no such file') || errorOutput.includes('does not exist')
    ).toBe(true);
  }, 15000);

  it('should handle remote URL (error case)', async () => {
    const remoteUrl = 'https://nonexistent-domain-12345.com/.well-known/agent.json';
    const result = await runCapiscio(['score', remoteUrl]);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('network') ||
      errorOutput.includes('connection') ||
      errorOutput.includes('fetch') ||
      errorOutput.includes('unreachable') ||
      errorOutput.includes('failed')
    ).toBe(true);
  }, 15000);

  it('should support verbose flag', async () => {
    const result = await runCapiscio(['score', validCardPath, '--verbose']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  }, 15000);

  it('should score minimal agent card', async () => {
    const minimalCard = {
      version: '1.0',
      did: 'did:web:minimal.example.com',
      name: 'Minimal Agent',
    };

    const minimalPath = path.join(E2E_CONFIG.fixturesDir, 'minimal-agent-card.json');
    await fs.writeFile(minimalPath, JSON.stringify(minimalCard, null, 2));

    try {
      const result = await runCapiscio(['score', minimalPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    } finally {
      // Cleanup
      try {
        await fs.unlink(minimalPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }, 15000);

  it('should display help for score command', async () => {
    const result = await runCapiscio(['score', '--help']);

    expect(result.exitCode).toBe(0);
    const helpText = result.stdout.toLowerCase();
    expect(helpText.includes('score')).toBe(true);
    expect(
      helpText.includes('usage') || helpText.includes('options') || helpText.includes('arguments')
    ).toBe(true);
  }, 15000);
});
