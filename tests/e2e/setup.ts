/**
 * Global setup and configuration for E2E tests.
 * 
 * These tests run the capiscio CLI against a live server.
 * Supports both local Docker environment and dev.registry.capisc.io.
 */

import { beforeAll } from 'vitest';
import axios from 'axios';
import path from 'path';

export const E2E_CONFIG = {
  apiUrl: process.env.CAPISCIO_API_URL || 'http://localhost:8080',
  apiKey: process.env.CAPISCIO_API_KEY || '',
  testAgentId: process.env.CAPISCIO_TEST_AGENT_ID || '',
  fixturesDir: path.join(__dirname, 'fixtures'),
};

/**
 * Wait for server to be ready before running tests.
 */
export async function waitForServer(maxRetries = 30, retryDelay = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${E2E_CONFIG.apiUrl}/health`, { timeout: 2000 });
      if (response.status === 200) {
        console.log(`✓ Server ready at ${E2E_CONFIG.apiUrl}`);
        return;
      }
    } catch (error) {
      // Ignore and retry
    }

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`Server not ready after ${maxRetries} retries at ${E2E_CONFIG.apiUrl}`);
}

/**
 * Setup hook - wait for server before running any E2E tests.
 */
beforeAll(async () => {
  await waitForServer();
}, 60000); // 60 second timeout for server startup
