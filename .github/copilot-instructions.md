# capiscio-node - GitHub Copilot Instructions

## ABSOLUTE RULES - NO EXCEPTIONS

### 1. ALL WORK VIA PULL REQUESTS
- **NEVER commit directly to `main`.** All changes MUST go through PRs.

### 2. LOCAL CI VALIDATION BEFORE PUSH
- Run: `pnpm test` and `pnpm build`

### 3. NO WATCH/BLOCKING COMMANDS
- **NEVER run blocking commands** without timeout

---

## CRITICAL: Read First

**Before starting work, read the workspace context files:**
1. `../../.context/CURRENT_SPRINT.md` - Sprint goals and priorities
2. `../../.context/ACTIVE_TASKS.md` - Active tasks

---

## Repository Purpose

**capiscio-node** is the Node.js/npm CLI wrapper for capiscio-core. It auto-downloads
the platform-specific Go binary and passes all commands through transparently.

Published to npm as `capiscio`. Users install via `npm install -g capiscio`.

**Technology Stack**: TypeScript, Node.js, npm

**Current Version**: v2.4.0
**Default Branch:** `main`

## Architecture

This is a **thin passthrough wrapper**, NOT a reimplementation. All logic lives in capiscio-core.

```
capiscio-node/
├── src/
│   ├── cli.ts               # Main entry point - parses args, delegates to binary
│   ├── index.ts              # Library exports
│   └── utils/
│       └── binary-manager.ts # Downloads + caches platform-specific capiscio-core binary
├── bin/
│   └── capiscio.js           # npm bin entry point
└── package.json              # npm package config (name: "capiscio")
```

### How It Works

1. User runs `capiscio verify agent-card.json`
2. `cli.ts` invokes `BinaryManager` to ensure Go binary is downloaded
3. Binary is cached in OS-specific cache dir
4. All args are passed through to the Go binary via `execa`

## Quick Commands

```bash
pnpm install     # Install deps
pnpm build       # Compile TypeScript
pnpm test        # Run tests
pnpm dev         # Dev mode
```

## Critical Rules

- **Never add CLI logic here** — all commands belong in capiscio-core
- Binary downloads use GitHub Releases from `capiscio/capiscio-core`
- Platform detection: `process.platform` + `process.arch`
- Version must stay aligned with capiscio-core

## Publishing

npm publish is triggered by creating a GitHub Release (NOT just a tag push).
```bash
git tag v2.4.1 && git push origin v2.4.1
gh release create v2.4.1 --title "v2.4.1"  # THIS triggers npm publish
```
