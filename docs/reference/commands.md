---
title: CLI Commands Reference
description: Complete reference for all CapiscIO CLI commands
---

# CLI Commands Reference

The CapiscIO CLI passes all commands directly to the `capiscio-core` binary. This page documents all available commands.

## Wrapper Commands

These commands are handled by the Node.js wrapper itself:

| Command | Description |
|---------|-------------|
| `--wrapper-version` | Display wrapper package version |
| `--wrapper-clean` | Remove cached binary, forcing re-download |

## Core Commands

All other commands are passed through to `capiscio-core`:

### validate

Validate an Agent Card for A2A protocol compliance.

```bash
capiscio validate [file-or-url] [flags]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--strict` | Enable strict validation mode |
| `--json` | Output results as JSON |
| `--schema-only` | Validate schema only, skip endpoint testing |
| `--test-live` | Test live agent endpoint |
| `--skip-signature` | Skip JWS signature verification |
| `--registry-ready` | Check registry deployment readiness |
| `--errors-only` | Show only errors and warnings |
| `--timeout <duration>` | Request timeout (default: 10s) |

**Examples:**

```bash
# Validate local file
capiscio validate ./agent-card.json

# Validate with JSON output
capiscio validate ./agent-card.json --json

# Validate URL
capiscio validate https://example.com/.well-known/agent-card.json

# Strict mode for production
capiscio validate ./agent-card.json --strict

# Test live endpoint
capiscio validate ./agent-card.json --test-live
```

---

### badge

Manage Trust Badges (RFC-002).

#### badge issue

Issue a new Trust Badge.

```bash
capiscio badge issue [flags]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--self-sign` | Issue self-signed badge (Level 0, did:key) |
| `--level <0-4>` | Trust level (0=SS, 1=DV, 2=OV, 3=EV, 4=CV) |
| `--sub <did>` | Subject DID |
| `--aud <urls>` | Audience (comma-separated URLs) |
| `--exp <duration>` | Expiration duration (default: 5m) |
| `--key <path>` | Path to private key file |

**Examples:**

```bash
# Self-signed badge for development
capiscio badge issue --self-sign

# With custom expiration
capiscio badge issue --self-sign --exp 1h

# With audience restriction
capiscio badge issue --self-sign --aud "https://api.example.com"
```

#### badge verify

Verify a Trust Badge.

```bash
capiscio badge verify <token> [flags]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--accept-self-signed` | Accept self-signed badges (Level 0) |
| `--audience <url>` | Verify audience claim |
| `--skip-revocation` | Skip revocation check |
| `--json` | Output as JSON |

**Examples:**

```bash
# Verify badge (rejects self-signed by default)
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..."

# Accept self-signed for development
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..." --accept-self-signed

# JSON output
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..." --json
```

---

### key

Manage cryptographic keys.

```bash
capiscio key [command]
```

**Subcommands:**

- `generate` - Generate a new key pair
- `list` - List stored keys

---

### gateway

Start the CapiscIO Gateway server.

```bash
capiscio gateway [flags]
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation/verification failed |
| `2` | Network error |
| `3` | Protocol violation |

## Getting Help

```bash
# General help
capiscio --help

# Command-specific help
capiscio validate --help
capiscio badge --help
capiscio badge issue --help
```
