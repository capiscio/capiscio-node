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

## Quick Start

```bash
# Install globally
npm install -g capiscio

# Validate an agent card
capiscio validate ./agent-card.json

# Validate with JSON output (includes scores)
capiscio validate ./agent-card.json --json

# Issue a self-signed badge (development)
capiscio badge issue --self-sign

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
