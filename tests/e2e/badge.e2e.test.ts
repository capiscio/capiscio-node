/**
 * E2E tests for capiscio badge commands.
 * 
 * Tests badge issuance and verification commands against the CLI.
 * These tests focus on the CLI interface itself, not the server.
 */

import { describe, it, expect } from 'vitest';
import { runCapiscio, extractToken } from './helpers';

describe('badge commands', () => {
  describe('badge issue', () => {
    it('should issue a self-signed badge', async () => {
      const result = await runCapiscio([
        'badge', 'issue', '--self-sign', '--domain', 'test.example.com'
      ]);

      // Self-signed badge issuance should succeed
      expect(result.exitCode).toBe(0);
      
      // Output should contain a JWT token (has dots for header.payload.signature)
      // Get last line in case there are download messages
      const token = extractToken(result.stdout);
      expect(token.split('.').length).toBe(3); // JWT format
    }, 15000);

    it('should issue badge with custom expiration', async () => {
      const result = await runCapiscio([
        'badge', 'issue', '--self-sign', '--exp', '10m'
      ]);

      expect(result.exitCode).toBe(0);
      const token = extractToken(result.stdout);
      expect(token.split('.').length).toBe(3);
    }, 15000);

    it('should issue badge with audience restriction', async () => {
      const result = await runCapiscio([
        'badge', 'issue', '--self-sign', '--aud', 'https://api.example.com'
      ]);

      expect(result.exitCode).toBe(0);
      const token = extractToken(result.stdout);
      expect(token.split('.').length).toBe(3);
    }, 15000);

    it('should display help for badge issue', async () => {
      const result = await runCapiscio(['badge', 'issue', '--help']);

      expect(result.exitCode).toBe(0);
      const helpText = result.stdout.toLowerCase();
      expect(helpText.includes('issue')).toBe(true);
      expect(helpText.includes('self-sign') || helpText.includes('level')).toBe(true);
    }, 15000);
  });

  describe('badge verify', () => {
    it('should verify a self-signed badge', async () => {
      // First issue a badge
      const issueResult = await runCapiscio([
        'badge', 'issue', '--self-sign', '--domain', 'test.example.com'
      ]);
      expect(issueResult.exitCode).toBe(0);
      const token = extractToken(issueResult.stdout);

      // Then verify it with --accept-self-signed
      const verifyResult = await runCapiscio([
        'badge', 'verify', token, '--accept-self-signed', '--offline'
      ]);

      expect(verifyResult.exitCode).toBe(0);
      const output = verifyResult.stdout.toLowerCase();
      expect(
        output.includes('valid') || output.includes('verified') || output.includes('ok')
      ).toBe(true);
    }, 15000);

    it('should fail for invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';
      const result = await runCapiscio(['badge', 'verify', invalidToken, '--accept-self-signed']);

      expect(result.exitCode).not.toBe(0);
      const errorOutput = (result.stderr + result.stdout).toLowerCase();
      expect(
        errorOutput.includes('invalid') ||
        errorOutput.includes('verify') ||
        errorOutput.includes('failed') ||
        errorOutput.includes('malformed') ||
        errorOutput.includes('error')
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
