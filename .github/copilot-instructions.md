# capiscio-node - GitHub Copilot Instructions

## ABSOLUTE RULES - NO EXCEPTIONS

### 1. ALL WORK VIA PULL REQUESTS
- **NEVER commit directly to `main`.** All changes MUST go through PRs.

### 2. LOCAL CI VALIDATION BEFORE PUSH
- Run: `npm test` and `npm run build`

### 3. NO WATCH/BLOCKING COMMANDS
- **NEVER run blocking commands in automation** without timeout
- Watch commands (`npm run dev`, `npm run test:watch`) are fine for interactive local dev

---

## CRITICAL: Read First

**If working inside the CapiscIO monorepo workspace that includes `.context/`, read these workspace context files before starting work:**
1. `../../.context/CURRENT_SPRINT.md` - Sprint goals and priorities
2. `../../.context/ACTIVE_TASKS.md` - Active tasks

If these files are not present in your checkout of this repository, skip this step.

---

## Repository Purpose

**capiscio-node** is the Node.js/npm CLI wrapper for capiscio-core. It auto-downloads
the platform-specific Go binary and passes all commands through transparently.

Published to npm as `capiscio`. Users install via `npm install -g capiscio`.

**Technology Stack**: TypeScript, Node.js, npm (NOT pnpm — this repo uses package-lock.json)

**Current Version**: v2.4.0 (wrapper); core binary version is controlled by `DEFAULT_VERSION` in `binary-manager.ts`
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

1. User runs `capiscio validate agent-card.json`
2. `cli.ts` invokes `BinaryManager` to ensure Go binary is downloaded
3. Binary is installed to `<packageRoot>/bin` (or falls back to `~/.capiscio/bin`)
4. All args are passed through to the Go binary via `execa`

## Quick Commands

```bash
npm install      # Install deps
npm run build    # Compile TypeScript
npm test         # Run tests
npm run dev      # Dev mode (watch - interactive only)
```

## Critical Rules

- **Never add CLI logic here** — all commands belong in capiscio-core
- Binary downloads use GitHub Releases from `capiscio/capiscio-core`
- Platform detection: `os.platform()` + `os.arch()`, mapped to `darwin/linux/windows` and `amd64/arm64`
- The `CORE_VERSION` constant in `src/utils/binary-manager.ts` must track the capiscio-core release tag used for the downloaded binary; the npm package version can differ

## Publishing

npm publish is triggered by creating a **published** GitHub Release (NOT just a tag push). Draft or prerelease releases will **not** trigger npm publish.
```bash
git tag v2.4.1 && git push origin v2.4.1
gh release create v2.4.1 --title "v2.4.1"  # Creates a PUBLISHED release, which triggers npm publish
```
