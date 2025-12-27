/**
 * E2E tests for capiscio validate command.
 * 
 * Tests the validate command against a live server, ensuring it correctly
 * validates agent cards from both local files and remote URLs.
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { E2E_CONFIG } from './setup';

const execAsync = promisify(exec);
const CLI_PATH = path.join(__dirname, '../../bin/capiscio.js');

/**
 * Helper to run capiscio CLI command.
 */
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

describe('validate command', () => {
  const validCardPath = path.join(E2E_CONFIG.fixturesDir, 'valid-agent-card.json');
  const invalidCardPath = path.join(E2E_CONFIG.fixturesDir, 'invalid-agent-card.json');
  const malformedPath = path.join(E2E_CONFIG.fixturesDir, 'malformed.json');
  const nonexistentPath = path.join(E2E_CONFIG.fixturesDir, 'does-not-exist.json');

  it('should validate a valid local agent card file', async () => {
    const result = await runCapiscio(['validate', validCardPath]);

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toLowerCase();
    expect(
      output.includes('valid') || output.includes('success') || output.includes('ok')
    ).toBe(true);
  }, 15000);

  it('should fail for an invalid local agent card file', async () => {
    const result = await runCapiscio(['validate', invalidCardPath]);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('invalid') || errorOutput.includes('error') || errorOutput.includes('failed')
    ).toBe(true);
  }, 15000);

  it('should fail for malformed JSON', async () => {
    const result = await runCapiscio(['validate', malformedPath]);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('json') || errorOutput.includes('parse') || errorOutput.includes('invalid')
    ).toBe(true);
  }, 15000);

  it('should fail for nonexistent file', async () => {
    const result = await runCapiscio(['validate', nonexistentPath]);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('not found') || errorOutput.includes('no such file') || errorOutput.includes('does not exist')
    ).toBe(true);
  }, 15000);

  it('should handle remote URL (error case)', async () => {
    const remoteUrl = 'https://nonexistent-domain-12345.com/.well-known/agent.json';
    const result = await runCapiscio(['validate', remoteUrl]);

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
    const result = await runCapiscio(['validate', validCardPath, '--verbose']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  }, 15000);

  it('should support JSON output format', async () => {
    const result = await runCapiscio(['validate', validCardPath, '--output', 'json']);

    expect(result.exitCode).toBe(0);
    
    // Verify output is valid JSON
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    const output = JSON.parse(result.stdout);
    expect(typeof output).toBe('object');
  }, 15000);

  it('should display help for validate command', async () => {
    const result = await runCapiscio(['validate', '--help']);

    expect(result.exitCode).toBe(0);
    const helpText = result.stdout.toLowerCase();
    expect(helpText.includes('validate')).toBe(true);
    expect(
      helpText.includes('usage') || helpText.includes('options') || helpText.includes('arguments')
    ).toBe(true);
  }, 15000);
});
