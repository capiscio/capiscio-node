# CapiscIO CLI (Node.js)

**The official command-line interface for CapiscIO, the Agent-to-Agent (A2A) validation platform.**

[![npm version](https://badge.fury.io/js/capiscio.svg)](https://badge.fury.io/js/capiscio)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/capiscio)](https://www.npmjs.com/package/capiscio)

## Overview

This package provides a convenient Node.js distribution for the **CapiscIO CLI**. It acts as a smart wrapper that automatically manages the underlying `capiscio-core` binary (written in Go), ensuring you always have the correct executable for your operating system and architecture.

> **Note:** This is a wrapper. The core logic resides in [capiscio-core](https://github.com/capiscio/capiscio-core).

## Installation

```bash
npm install -g capiscio
```

## Usage

Once installed, the `capiscio` command is available in your terminal. It passes all arguments directly to the core binary.

```bash
# Validate an agent card
capiscio validate ./agent-card.json

# Validate with JSON output
capiscio validate https://my-agent.example.com --json

# Issue a self-signed badge (development)
capiscio badge issue --self-sign --sub did:web:example.com:agents:my-agent

# Verify a badge (offline mode)
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..." --offline

# Check version
capiscio --version

# Get help
capiscio --help
```

### Wrapper Utilities

The Node.js wrapper includes specific commands to manage the binary:

| Command | Description |
|---------|-------------|
| `capiscio --wrapper-version` | Display the version of this Node.js wrapper package. |
| `capiscio --wrapper-clean` | Remove the cached `capiscio-core` binary (forces re-download on next run). |

## How It Works

1. **Detection**: When you run `capiscio`, the script detects your OS (Linux, macOS, Windows) and Architecture (AMD64, ARM64).
2. **Provisioning**: It checks if the correct `capiscio-core` binary is present:
   - **Primary**: `<package>/bin/capiscio` (alongside node_modules)
   - **Fallback**: `~/.capiscio/bin/capiscio` (if package dir is read-only)
   - *Windows fallback*: `%USERPROFILE%\.capiscio\bin`
3. **Download**: If missing, it downloads the release from GitHub on first run (no postinstall script).
4. **Execution**: It seamlessly delegates to the Go binary, passing all arguments through.

## Supported Platforms

- **macOS**: AMD64 (Intel), ARM64 (Apple Silicon)
- **Linux**: AMD64, ARM64
- **Windows**: AMD64

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CAPISCIO_CORE_VERSION` | Override the default core binary version (e.g., `v1.0.2`) |
| `CAPISCIO_CORE_PATH` | Use a specific binary path instead of auto-downloading |

## Binary Integrity Verification

On first run, the wrapper downloads the capiscio-core binary and verifies its SHA-256 checksum
against the published `checksums.txt` from the GitHub release.

If verification fails or the checksums file is unavailable:

```bash
# Temporary bypass (not recommended for production)
export CAPISCIO_SKIP_CHECKSUM=true
```

## Troubleshooting

**"Permission denied" errors:**
Ensure your user has write access to the cache directory. You can reset the cache by running:
```bash
capiscio --wrapper-clean
```

**"Binary not found" or download errors:**
If you are behind a corporate firewall, ensure you can access `github.com`.

**Checksum verification failures:**
If you see "Checksum verification failed", the binary integrity could not be confirmed.
This can happen with pre-release versions or network issues. See the [Binary Integrity Verification](#binary-integrity-verification) section above.

## Related Packages

- **[capiscio](https://pypi.org/project/capiscio/)** - Python CLI wrapper (identical functionality)
- **[capiscio-sdk-python](https://pypi.org/project/capiscio-sdk/)** - Python SDK for programmatic usage
- **[capiscio-core](https://github.com/capiscio/capiscio-core)** - Go core engine

## License

Apache-2.0
