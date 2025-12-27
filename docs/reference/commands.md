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
| `--self-sign` | Issue self-signed badge for development |
| `--level <1-3>` | Trust level (1=DV, 2=OV, 3=EV) |
| `--sub <did>` | Subject DID (did:web format) |
| `--aud <urls>` | Audience (comma-separated URLs) |
| `--exp <duration>` | Expiration duration (default: 5m) |
| `--key <path>` | Path to private key file |
| `--domain <string>` | Agent domain |
| `--iss <url>` | Issuer URL |

**Examples:**

```bash
# Self-signed badge for development
capiscio badge issue --self-sign --sub did:web:example.com:agents:my-agent

# With specific trust level
capiscio badge issue --self-sign --level 2 --domain example.com

# With audience restriction
capiscio badge issue --self-sign --aud "https://api.example.com,https://backup.example.com"
```

#### badge verify

Verify a Trust Badge.

```bash
capiscio badge verify <token> [flags]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--key <path>` | Path to public key file (JWK) |
| `--offline` | Offline mode (uses trust store) |
| `--audience <url>` | Verifier's identity for audience validation |
| `--skip-revocation` | Skip revocation check (testing only) |
| `--skip-agent-status` | Skip agent status check (testing only) |
| `--trusted-issuers <urls>` | Comma-separated list of trusted issuer URLs |

**Examples:**

```bash
# Verify badge with CA public key
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..." --key ca-public.jwk

# Offline verification (uses local trust store)
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..." --offline

# With audience validation
capiscio badge verify "eyJhbGciOiJFZERTQSJ9..." --key ca.jwk --audience https://api.example.com
```

#### badge keep

Run a daemon that automatically renews badges before expiry.

```bash
capiscio badge keep [flags]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--self-sign` | Self-sign instead of requesting from CA |
| `--key <path>` | Path to private key file (required for self-sign) |
| `--out <path>` | Output file path (default: badge.jwt) |
| `--exp <duration>` | Expiration duration (default: 5m) |
| `--renew-before <duration>` | Time before expiry to renew (default: 1m) |
| `--check-interval <duration>` | Interval to check for renewal (default: 30s) |

---

### key

Manage cryptographic keys.

```bash
capiscio key [command]
```

**Subcommands:**

- `gen` - Generate a new Ed25519 key pair

**Example:**

```bash
# Generate a new key pair
capiscio key gen --out-priv private.jwk --out-pub public.jwk
```

---

### trust

Manage the local trust store for offline badge verification.

```bash
capiscio trust [command]
```

**Subcommands:**

- `add` - Add a CA public key to the trust store
- `list` - List trusted CA keys
- `remove` - Remove a CA key from the trust store

**Location:** `~/.capiscio/trust/` (or `$CAPISCIO_TRUST_PATH`)

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
