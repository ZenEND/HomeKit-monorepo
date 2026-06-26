# HomeKit Monorepo

A pnpm workspace monorepo containing all HomeKit packages under `packages/`.

## Packages

| Package | Name | Description |
|---|---|---|
| `packages/api` | `api` | NestJS backend — TypeORM, PostgreSQL, Swagger |
| `packages/web` | `web` | React + Vite frontend — Zustand, React Router, Tailwind |
| `packages/engine` | `@homekit/engine` | Shared game-engine types and effect registry |
| `packages/types` | `@homekit/types` | Shared domain types used by both `api` and `web` |

## Prerequisites

- [Node.js 22+](https://nodejs.org/) (see `.nvmrc`)
- [pnpm](https://pnpm.io/) — `corepack enable && corepack prepare pnpm --activate`
- [Docker](https://www.docker.com/) and Docker Compose (for the database and containerised dev)

## Workspace layout

```
HomeKit-monorepo/
├── packages/
│   ├── api/             # NestJS backend
│   ├── web/             # React + Vite frontend
│   ├── engine/          # @homekit/engine — game logic & effect definitions
│   └── types/           # @homekit/types — shared domain types
├── docker-compose.yml   # Local dev stack (postgres + api + web)
├── pnpm-workspace.yaml  # workspace: packages/*
└── package.json         # Root scripts
```

### How pnpm workspaces work

`pnpm-workspace.yaml` lists all packages that belong to the workspace:

```yaml
packages:
  - 'packages/*'
```

Every directory directly under `packages/` is treated as a workspace package.
pnpm creates symlinks in each package's `node_modules` so that internal packages
like `@homekit/engine` and `@homekit/types` are resolved as if they were published
to npm, but from the local filesystem. The `workspace:*` version range in
`package.json` dependencies pins the link to the local version.

Workspace packages are resolved **by TypeScript and Vite to their TypeScript source**
(no build step required for development):

- `packages/api/tsconfig.json` maps `@homekit/engine` and `@homekit/types` to their
  `src/index.ts` via `compilerOptions.paths`. NestJS CLI (ts-node) then compiles
  those files alongside the API source.
- `packages/web/vite.config.ts` adds `resolve.alias` entries that point Vite
  directly at the source TypeScript files.

## Quick start — local (no container rebuild)

This is the fastest workflow. Only PostgreSQL and Redis run in Docker; Node.js
processes run directly on your machine so changes are picked up instantly.

### 1. Install dependencies

```bash
corepack enable
pnpm install
```

### 2. Configure environment

```bash
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env if you need custom values (defaults work out of the box)
```

### 3. Start infrastructure (Postgres + Redis only)

```bash
docker compose up postgres redis -d
```

Both containers expose their default ports (`5432`, `6379`) and persist data in
named Docker volumes (`pgdata`, `redisdata`), so your data survives container
restarts **and you never need to rebuild them**.

To stop them later:

```bash
docker compose stop postgres redis
# or remove containers + keep volumes:
docker compose down          # keeps volumes
docker compose down -v       # also wipes volumes (fresh DB / cache)
```

### 4. Start API in dev mode

```bash
pnpm dev:api     # builds engine/types once, then NestJS watch mode → http://localhost:3000
```

> NestJS watch mode (`nest start --watch`) recompiles only the changed file on
> every save — no manual rebuild, no container restart needed.

### 5. Start frontend in dev mode (separate terminal)

```bash
pnpm dev:web     # Vite HMR → http://localhost:5173
```

### 6. Open the app

| URL | Description |
|-----|-------------|
| http://localhost:5173 | React frontend |
| http://localhost:3000/api | Swagger UI |
| http://localhost:3000 | API health |
| localhost:6379 | Redis (use `redis-cli` or any GUI) |
| localhost:5432 | PostgreSQL |

### Useful one-liners

```bash
# Inspect Redis keys (game rooms, etc.)
docker exec -it homekit-redis redis-cli KEYS '*'

# Flush Redis without restarting
docker exec -it homekit-redis redis-cli FLUSHALL

# Connect to Postgres
docker exec -it homekit-postgres psql -U homekit -d homekit

# Re-build engine only (when you change packages/engine/src)
pnpm --filter @homekit/engine build
```

---

## Quick start — full Docker (all services in containers)

Use this when you want to test the production-like stack or share a demo.

```bash
cp packages/api/.env.example packages/api/.env
docker compose up --build
```

> You need to rebuild (`--build`) only when `Dockerfile` or `package.json`
> changes. Normal code edits are picked up via bind-mounts + watch mode.

### Services

| Service  | URL                   | Notes |
|----------|-----------------------|-------|
| web      | http://localhost:5173 | Vite dev server with HMR |
| api      | http://localhost:3000 | NestJS watch mode |
| postgres | localhost:5432        | PostgreSQL 16 |
| redis    | localhost:6379        | Redis 7 |

### Hot reload in containers

- **api** — `packages/api/` bind-mounted; Nest recompiles on save
- **web** — `packages/web/` bind-mounted; Vite applies HMR instantly
- **engine/types** — both bind-mounted in all containers; rebuild with
  `pnpm --filter @homekit/engine build` on host then restart only the api container:

```bash
pnpm --filter @homekit/engine build
docker compose restart api
```

---

## LAN access — reaching services from other devices

By default all URLs point to `localhost`, which means only the host machine can
open the app. To expose services to phones, tablets, or other PCs on your
network, set the `HOST` variable to your machine's LAN IP.

### 1. Find your LAN IP

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

### 2. Set HOST in .env

```bash
# .env (root)
HOST=192.168.1.10   # ← your actual LAN IP
```

### 3. Option A — direct ports (simplest)

Each service is accessible on its own port:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web     | http://192.168.1.10:5173 |
| API     | http://192.168.1.10:3000 |
| Swagger | http://192.168.1.10:3000/api |
| Redis   | 192.168.1.10:6379 |
| Postgres| 192.168.1.10:5432 |

### 3. Option B — web on port 80 via Nginx

Nginx serves the frontend on port 80 so users don't have to type `:5173`.
The API stays on port 3000 directly — this keeps Socket.IO simple (no path
rewriting, no namespace issues).

```bash
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up --build
```

| Service | URL |
|---------|-----|
| Web     | http://192.168.1.10 |
| API     | http://192.168.1.10:3000 |
| Swagger | http://192.168.1.10:3000/api |

> The Nginx config lives in `nginx/nginx.conf`. It proxies WebSocket upgrades
> for Vite HMR. Socket.IO connects directly to port 3000, bypassing nginx.

### Optional: per-machine override file

Copy the example override and set your IP there instead of in `.env`:

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
# edit docker-compose.override.yml and set HOST=<your IP>
```

`docker-compose.override.yml` is gitignored and loaded automatically by
`docker compose up`, so you never accidentally commit a machine-specific IP.

## Root scripts

| Script               | Description                                              |
|----------------------|----------------------------------------------------------|
| `pnpm build:packages`| Build `@homekit/engine` + `@homekit/types` to `dist/`   |
| `pnpm dev`           | Build packages then run api + web in parallel            |
| `pnpm dev:api`       | Build packages then run NestJS in watch mode             |
| `pnpm dev:web`       | Build packages then run Vite dev server                  |
| `pnpm build`         | Build everything (packages → api → web)                  |
| `pnpm build:api`     | Build packages then NestJS app                           |
| `pnpm build:web`     | Build packages then frontend for production              |
| `pnpm typecheck`     | Run tsc --noEmit across all packages                     |
| `pnpm lint`          | Run ESLint across all packages                           |

## Shared packages

### `@homekit/engine`

Game-engine types and the effect registry. Both `api` and `web` depend on this.
Neither package needs to build it — the API resolves it via tsconfig `paths`,
and Vite resolves it via `resolve.alias`.

Key exports: `EffectDefinition`, `EffectInstance`, `EffectParam`, `EffectCategory`,
`EffectRegistry`, `createDefaultRegistry`.

### `@homekit/types`

Domain types shared between the API and the web client.

Key exports: `Card`, `CardType`, `CardStatus`, `CardStats`, `CreateCardPayload`,
`CardsQuery`, `CarryEffect`, `GmApprovalPayload`, `RolesEnum`.

`api` uses these types in its entities and DTOs.
`web` uses them in API client functions and components.

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable       | Default                     | Description                                          |
|----------------|-----------------------------|------------------------------------------------------|
| `HOST`         | `localhost`                 | Host/IP used to build service URLs for LAN access    |
| `DB_HOST`      | `postgres` / `localhost`    | PostgreSQL host                                      |
| `DB_PORT`      | `5432`                      | PostgreSQL port                                      |
| `DB_USER`      | `homekit`                   | Database user                                        |
| `DB_PASSWORD`  | `homekit`                   | Database password                                    |
| `DB_NAME`      | `homekit`                   | Database name                                        |
| `REDIS_URL`    | `redis://localhost:6379`    | Redis connection URL (game rooms)                    |
| `PORT`         | `3000`                      | API server port                                      |
| `VITE_API_URL` | `http://${HOST}:3000`       | API base URL baked into the frontend bundle          |
| `CORS_ORIGIN`  | `http://${HOST}:5173`       | Origin the API accepts cross-origin requests from    |

## Notes

- TypeORM `synchronize: true` is enabled for local development only.
- Package-specific docs: [packages/api/README.md](packages/api/README.md), [packages/web/README.md](packages/web/README.md).
