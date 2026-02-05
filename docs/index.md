---
title: CapiscIO Node.js CLI - Documentation
description: Official documentation for the CapiscIO Node.js CLI wrapper.
---

# CapiscIO Node.js CLI

The **CapiscIO Node.js CLI** is a lightweight wrapper around the [CapiscIO Core](https://github.com/capiscio/capiscio-core) binary, designed for seamless integration into Node.js environments.

!!! info "This is a Wrapper Package"
    This package does NOT contain validation logic. It downloads and executes the `capiscio-core` Go binary, which performs the actual validation.

<div class="grid cards" markdown>

-   **🚀 Getting Started**

    ---

    Install the CLI via npm.

    [:octicons-arrow-right-24: Installation](./getting-started/installation.md)

-   **⚙️ Reference**

    ---

    Wrapper commands and usage.

    [:octicons-arrow-right-24: Commands](./reference/commands.md)

</div>

## Quick Start: One-Command Identity Setup

Get a complete agent identity, just like Let's Encrypt made HTTPS easy:

```bash
# Install globally
npm install -g capiscio

# Set your API key (get one free at app.capisc.io)
export CAPISCIO_API_KEY=sk_live_...

# One command does everything!
capiscio init
```

**What happens automatically:**

- ✅ Ed25519 key pair generated
- ✅ `did:key` identity derived
- ✅ DID registered with CapiscIO
- ✅ Agent card created
- ✅ Trust badge requested

Your `.capiscio/` directory now contains:

```
.capiscio/
├── private.jwk      # Keep this secret!
├── public.jwk
├── did.txt          # Your agent's identity
└── agent-card.json  # A2A-compliant agent card
```

### Two Setup Paths

| Path | When to Use | Command |
|------|-------------|---------|
| **Quick Start** | Getting started, single agent | `capiscio init` |
| **UI-First** | Teams, multiple agents | `capiscio init --agent-id agt_123` |

## Other Commands

```bash
# Validate an agent card
capiscio validate ./agent-card.json

# Validate with JSON output
capiscio validate ./agent-card.json --json

# Issue a self-signed badge (development)
capiscio badge issue --self-sign --sub did:web:example.com:agents:my-agent

# Check core version
capiscio --version
```

## What This Package Does

1. **Downloads** the correct `capiscio-core` binary for your platform (macOS/Linux/Windows, AMD64/ARM64)
2. **Caches** the binary in `~/.capiscio/bin` (or `%USERPROFILE%\.capiscio\bin` on Windows)
3. **Executes** the binary with your arguments via `execa` with inherited stdio

All validation logic lives in `capiscio-core`. This wrapper just makes it easy to install via npm.

## Wrapper-Specific Commands

| Command | Description |
|---------|-------------|
| `capiscio --wrapper-version` | Display the wrapper package version |
| `capiscio --wrapper-clean` | Remove cached binary (forces re-download) |
