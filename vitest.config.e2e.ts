import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // E2E tests run the CLI offline
    environment: 'node',
    
    // Include only E2E tests
    include: ['tests/e2e/**/*.e2e.test.ts'],
    
    // Longer timeouts for E2E tests
    testTimeout: 30000,
    hookTimeout: 60000,
    
    // Run tests serially to avoid race conditions
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
  }
});
