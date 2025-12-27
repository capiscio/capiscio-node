/**
 * Shared test helpers for E2E tests.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const CLI_PATH = path.join(__dirname, '../../bin/capiscio.js');
export const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/**
 * Run the capiscio CLI with the given arguments.
 */
export async function runCapiscio(
  args: string[],
  env?: Record<string, string>
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" ${args.join(' ')}`, {
      env: { ...process.env, ...env },
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.code || 1,
    };
  }
}

/**
 * Extract token from CLI output - handles potential download messages on first run.
 * The CLI may print download progress before the actual output.
 */
export function extractToken(stdout: string): string {
  const lines = stdout.trim().split('\n');
  return lines[lines.length - 1].trim();
}
