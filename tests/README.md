# E2E Tests for capiscio-node CLI

This directory contains end-to-end tests that test the `capiscio` CLI against a live server.

## Directory Structure

```
tests/
├── unit/              # Unit tests with mocks (no server required)
│   └── cli.test.ts
└── e2e/               # E2E tests against live server
    ├── setup.ts       # Global setup and server wait logic
    ├── fixtures/      # Test data files
    │   ├── valid-agent-card.json
    │   ├── invalid-agent-card.json
    │   └── malformed.json
    ├── validate.e2e.test.ts  # Validation command tests
    ├── score.e2e.test.ts     # Score command tests
    ├── badge.e2e.test.ts     # Badge issuance/verification tests
    └── status.e2e.test.ts    # Status check tests
```

## Running Tests

### Run All Tests

```bash
npm test              # Unit tests only (default)
npm run test:all      # Both unit and E2E tests
```

### Run Only Unit Tests

```bash
npm run test:unit
```

### Run Only E2E Tests

```bash
npm run test:e2e
```

### Run with Watch Mode

```bash
npm run test:watch
```

### Run with Coverage

```bash
npm run test:coverage
```

## Environment Configuration

E2E tests require a running CapiscIO server. Configure the server URL and credentials using environment variables:

### Local Development (Default)

```bash
export CAPISCIO_API_URL=http://localhost:8080
export CAPISCIO_API_KEY=your_test_api_key
export CAPISCIO_TEST_AGENT_ID=your_test_agent_id
```

### Dev Environment

```bash
export CAPISCIO_API_URL=https://dev.registry.capisc.io
export CAPISCIO_API_KEY=your_dev_api_key
export CAPISCIO_TEST_AGENT_ID=your_dev_agent_id
```

### Using .env File (Recommended)

Create a `.env` file in the project root:

```bash
CAPISCIO_API_URL=http://localhost:8080
CAPISCIO_API_KEY=test_api_key_xxx
CAPISCIO_TEST_AGENT_ID=123e4567-e89b-12d3-a456-426614174000
```

Then load it before running tests:

```bash
export $(cat .env | xargs)
npm run test:e2e
```

## Test Coverage

### Validate Command (`validate.e2e.test.ts`)

- ✅ Valid local agent card file
- ✅ Invalid local agent card file
- ✅ Malformed JSON file
- ✅ Nonexistent file
- ✅ Remote URL (error handling)
- ✅ Verbose output flag
- ✅ JSON output format
- ✅ Help command

### Score Command (`score.e2e.test.ts`)

- ✅ Valid local agent card
- ✅ Invalid local agent card
- ✅ JSON output format
- ✅ Nonexistent file
- ✅ Remote URL (error handling)
- ✅ Verbose output
- ✅ Minimal agent card
- ✅ Help command

### Badge Commands (`badge.e2e.test.ts`)

- ✅ Issue badge with API key (IAL-0)
- ✅ Issue badge without API key (should fail)
- ✅ Issue badge for invalid agent ID
- ✅ Verify invalid token
- ✅ Help commands (badge, issue, verify)

### Status Commands (`status.e2e.test.ts`)

- ✅ Agent status - valid agent
- ✅ Agent status - nonexistent agent
- ✅ Agent status - malformed ID
- ✅ Agent status - JSON output
- ✅ Badge status - nonexistent badge
- ✅ Badge status - malformed JTI
- ✅ Help commands (agent, badge)

## CI/CD Integration

The E2E tests are designed to run in CI/CD pipelines with a local test server. See `.github/workflows/e2e.yml` for the configuration.

## Notes

- **Server Wait**: Tests automatically wait for the server to be ready using the `setup.ts` file
- **Skipped Tests**: Tests requiring `CAPISCIO_API_KEY` or `CAPISCIO_TEST_AGENT_ID` are skipped if these environment variables are not set
- **Timeouts**: Network-related tests have 15-second timeouts to prevent hanging
- **Cleanup**: Temporary test fixtures are automatically cleaned up

## Troubleshooting

### Server Not Ready

If tests fail with "Server not ready":

```bash
# Check if server is running
curl http://localhost:8080/health

# Check Docker containers
docker ps
```

### Authentication Errors

If badge tests fail with auth errors:

```bash
# Verify API key is set
echo $CAPISCIO_API_KEY

# Test API key manually
curl -H "X-Capiscio-Registry-Key: $CAPISCIO_API_KEY" \
  http://localhost:8080/v1/sdk/agents
```

### TypeScript Build Errors

Ensure the project is built before running E2E tests:

```bash
npm run build
npm run test:e2e
```

### Path Issues

Ensure you're running tests from the project root:

```bash
cd /path/to/capiscio-node
npm run test:e2e
```
