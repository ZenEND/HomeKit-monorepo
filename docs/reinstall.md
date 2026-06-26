# Quick Reinstall Guide

Run this when:
- Node version mismatch (`crypto is not defined`, `Unsupported engine` warnings)
- `node_modules` is corrupted or out of sync
- You cloned the repo fresh
- `pnpm install` left stale lock conflicts

---

## TL;DR — one-shot reset

```bash
# From repo root
nvm install 22 && nvm use 22
corepack enable
node --version   # must print v22.x.x

rm -rf node_modules packages/*/node_modules
pnpm install
pnpm build:packages
```

---

## Step-by-step

### 1. Switch to Node 22

The project requires **Node ≥ 22** (set in `.nvmrc` and `package.json#engines`).
Node 18 is missing `globalThis.crypto` which breaks `@nestjs/typeorm@11`.

```bash
nvm install 22          # download if not installed
nvm use 22              # switch for this shell session
nvm alias default 22    # make it the default for new shells
node --version          # → v22.x.x
```

If you don't have nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
# restart terminal, then:
nvm install 22 && nvm use 22
```

---

### 2. Enable corepack (pnpm manager)

```bash
corepack enable
corepack prepare pnpm@10.12.1 --activate
pnpm --version    # → 10.12.1
```

---

### 3. Wipe node_modules

```bash
# From repo root — removes root + all package node_modules
rm -rf node_modules packages/api/node_modules packages/web/node_modules \
       packages/engine/node_modules packages/types/node_modules
```

Or with pnpm's own prune:
```bash
pnpm store prune    # clean global cache (optional)
```

---

### 4. Install

```bash
pnpm install
```

This resolves all workspace packages and links `@homekit/engine` and
`@homekit/types` locally. Takes ~30–60 s on first run.

---

### 5. Build shared packages

The engine must be compiled before the API or web can import from it:

```bash
pnpm build:packages
```

---

### 6. Start infrastructure

```bash
docker compose up postgres redis -d
```

---

### 7. Start dev servers

```bash
# Terminal 1
pnpm dev:api     # → http://localhost:3000

# Terminal 2
pnpm dev:web     # → http://localhost:5173
```

---

## What was wrong (root package.json)

The root `package.json` previously had NestJS/TypeORM/Passport dependencies
that **belong only in `packages/api/package.json`**.

```json
// ❌ Was in root package.json (removed)
"dependencies": {
  "typeorm": "^1.0.0",          ← non-existent version (latest is 0.3.x)
  "@nestjs/typeorm": "^11.0.2", ← wrong place
  "bcrypt": "^6.0.0",           ← wrong place
  ...
}
```

Having these at root caused two problems:

1. **Version conflict** — pnpm hoisted `typeorm@^1.0.0` to root `node_modules`.
   Since `1.0.0` doesn't exist, pnpm may have resolved it to an unexpected version
   that shadowed the correct `0.3.20` in `packages/api/node_modules`.

2. **Wrong Node requirement** — `@nestjs/typeorm@11` uses `crypto.randomUUID()`
   as a global, only available in Node 19+. Running on Node 18 caused
   `ReferenceError: crypto is not defined` at startup.

The root `package.json` now only contains workspace scripts and engine config.
All API dependencies stay exclusively in `packages/api/package.json`.

---

## Dependency locations (correct)

| Dependency | Where it lives |
|-----------|----------------|
| `typeorm`, `@nestjs/typeorm`, `bcrypt`, `passport-*` | `packages/api/package.json` |
| `react`, `vite`, `tailwindcss`, `socket.io-client` | `packages/web/package.json` |
| `typescript` (dev) | each package individually |
| **Nothing NestJS/TypeORM** | ~~root `package.json`~~ |

---

## Verify after reinstall

```bash
node --version          # v22.x.x
pnpm --version          # 10.12.1
pnpm dev:api            # should start without crypto errors
```

Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)
Frontend: [http://localhost:5173](http://localhost:5173)
