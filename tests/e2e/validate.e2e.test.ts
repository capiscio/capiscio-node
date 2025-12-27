/**
 * E2E tests for capiscio validate command.
 * 
 * Tests the validate command locally, validating agent cards
 * from local files. Uses --schema-only for offline validation.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { runCapiscio, FIXTURES_DIR } from './helpers';

describe('validate command', () => {
  const validCardPath = path.join(FIXTURES_DIR, 'valid-agent-card.json');
  const invalidCardPath = path.join(FIXTURES_DIR, 'invalid-agent-card.json');
  const malformedPath = path.join(FIXTURES_DIR, 'malformed.txt');
  const nonexistentPath = path.join(FIXTURES_DIR, 'does-not-exist.json');

  it('should validate a valid local agent card file', async () => {
    const result = await runCapiscio(['validate', validCardPath, '--schema-only']);

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toLowerCase();
    expect(
      output.includes('pass') || output.includes('valid') || output.includes('✅')
    ).toBe(true);
  }, 15000);

  it('should fail for an invalid local agent card file', async () => {
    const result = await runCapiscio(['validate', invalidCardPath, '--schema-only']);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('fail') || errorOutput.includes('error') || errorOutput.includes('❌')
    ).toBe(true);
  }, 15000);

  it('should fail for malformed JSON', async () => {
    const result = await runCapiscio(['validate', malformedPath, '--schema-only']);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('json') || errorOutput.includes('parse') || errorOutput.includes('invalid') || errorOutput.includes('syntax')
    ).toBe(true);
  }, 15000);

  it('should fail for nonexistent file', async () => {
    const result = await runCapiscio(['validate', nonexistentPath, '--schema-only']);

    expect(result.exitCode).not.toBe(0);
    const errorOutput = (result.stderr + result.stdout).toLowerCase();
    expect(
      errorOutput.includes('not found') || 
      errorOutput.includes('no such file') || 
      errorOutput.includes('does not exist') ||
      errorOutput.includes('failed to load') ||
      errorOutput.includes('error')
    ).toBe(true);
  }, 15000);

  it('should support JSON output format', async () => {
    const result = await runCapiscio(['validate', validCardPath, '--schema-only', '--json']);

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
      helpText.includes('usage') || helpText.includes('options') || helpText.includes('flags')
    ).toBe(true);
  }, 15000);
});
