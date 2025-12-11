---
title: Installation
description: How to install the CapiscIO Node.js CLI
---

# Installation

## Requirements

- **Node.js** 16.0.0 or later
- **npm** or **yarn** or **pnpm**

## Install via npm (Recommended)

```bash
# Global installation (recommended for CLI usage)
npm install -g capiscio

# Verify installation
capiscio --version
```

## Install via yarn

```bash
yarn global add capiscio
```

## Install via pnpm

```bash
pnpm add -g capiscio
```

## First Run

On first run, the CLI will automatically download the `capiscio-core` binary for your platform:

```bash
$ capiscio --version
✔ Installed CapiscIO Core v1.0.2
capiscio version 1.0.2
```

The binary is cached in:

- **macOS/Linux**: `~/.capiscio/bin/`
- **Windows**: `%USERPROFILE%\.capiscio\bin\`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CAPISCIO_CORE_VERSION` | Override the default core binary version (e.g., `v1.0.3`) |
| `CAPISCIO_CORE_PATH` | Use a specific binary path instead of auto-downloading |

## Updating

To update to the latest version:

```bash
npm update -g capiscio
```

To force re-download of the core binary:

```bash
capiscio --wrapper-clean
capiscio --version  # Downloads fresh binary
```

## Uninstalling

```bash
# Remove the npm package
npm uninstall -g capiscio

# Optionally remove cached binary
rm -rf ~/.capiscio
```
