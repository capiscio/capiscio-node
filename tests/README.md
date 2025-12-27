# Tests for capiscio-node CLI

This directory contains unit and E2E tests for the `capiscio` CLI wrapper.

## Directory Structure

```
tests/
├── unit/              # Unit tests with mocks (no server required)
│   └── cli.test.ts
└── e2e/               # E2E tests (offline mode, no server required)
    ├── fixtures/      # Test data files
    │   ├── valid-agent-card.json
    │   ├── invalid-agent-card.json
    │   └── malformed.json
    ├── validate.e2e.test.ts  # Validation command tests
    └── badge.e2e.test.ts     # Badge issuance/verification tests
```

## Running Tests

### Run All Tests

```bash
pnpm test              # Unit tests only (default)
pnpm test:all          # Both unit and E2E tests
```

### Run Only Unit Tests

```bash
pnpm test:unit
```

### Run Only E2E Tests

```bash
pnpm test:e2e
```

### Run with Watch Mode

```bash
pnpm test:watch
```

### Run with Coverage

```bash
pnpm test:coverage
```

## E2E Test Design

The E2E tests are designed to run **offline** without requiring a server:

- **Validate tests**: Use `--schema-only` flag for local schema validation
- **Badge tests**: Use `--self-sign` for issuance and `--accept-self-signed --offline` for verification

This approach allows E2E tests to run in CI without complex server infrastructure.

## Test Coverage

### Validate Command (`validate.e2e.test.ts`)

- ✅ Valid local agent card file (schema-only mode)
- ✅ Invalid local agent card file
- ✅ Malformed JSON file
- ✅ Nonexistent file
- ✅ JSON output format
- ✅ Help command

### Badge Commands (`badge.e2e.test.ts`)

- ✅ Issue self-signed badge
- ✅ Issue badge with custom expiration
- ✅ Issue badge with audience restriction
- ✅ Verify self-signed badge (offline)
- ✅ Verify invalid token (error handling)
- ✅ Help commands (badge, issue, verify)

## CI/CD Integration

The E2E tests run in GitHub Actions without server dependencies:

```yaml
# See .github/workflows/e2e.yml
- name: Run E2E tests
  run: pnpm test:e2e
```

## Notes

- **Offline Mode**: All E2E tests run offline without server dependencies
- **Timeouts**: Tests have 15-second timeouts to prevent hanging
- **Download Messages**: On first run, the CLI may download the capiscio-core binary; tests handle this gracefully

## Troubleshooting

### TypeScript Build Errors

Ensure the project is built before running E2E tests:

```bash
pnpm build
pnpm test:e2e
```

### Path Issues

Ensure you're running tests from the project root:

```bash
cd /path/to/capiscio-node
pnpm test:e2e
```
