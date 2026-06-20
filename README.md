# HomeKit Monorepo

A pnpm workspace monorepo with:

- **api** — NestJS backend with TypeORM and PostgreSQL
- **web** — React frontend with Vite, TypeScript, Zustand, React Router, Sass, and PostCSS modules

## Prerequisites

- [Node.js 22+](https://nodejs.org/) (see `.nvmrc`)
- [pnpm](https://pnpm.io/) (via `corepack enable`)
- [Docker](https://www.docker.com/) and Docker Compose (for containerized development)

## Project structure

```
HomeKit-monorepo/
├── api/                 # NestJS backend
├── web/                 # React + Vite frontend
├── docker-compose.yml   # Local dev stack (postgres + api + web)
├── pnpm-workspace.yaml
└── package.json         # Root workspace scripts
```

## Quick start (local)

### 1. Install dependencies

```bash
corepack enable
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
cp api/.env.example api/.env
```

For local development without Docker, set `DB_HOST=localhost` in `api/.env`.

### 3. Start PostgreSQL

Run only the database container:

```bash
docker compose up postgres -d
```

### 4. Start development servers

In separate terminals:

```bash
pnpm dev:api   # http://localhost:3000
pnpm dev:web   # http://localhost:5173
```

Or run both in parallel:

```bash
pnpm dev
```

### 5. Verify

- Open [http://localhost:5173](http://localhost:5173) — frontend home page
- Open [http://localhost:3000](http://localhost:3000) — API health check JSON

The home page fetches the API health endpoint and shows database connection status.

## Quick start (Docker)

Run the full stack with hot reload:

```bash
cp .env.example .env
docker compose up --build
```

### Services

| Service  | URL                        | Description              |
|----------|----------------------------|--------------------------|
| web      | http://localhost:5173      | Vite dev server          |
| api      | http://localhost:3000      | NestJS API               |
| postgres | localhost:5432             | PostgreSQL database      |

### Hot reload

- **api**: source files in `api/` are bind-mounted; Nest watch mode restarts on changes
- **web**: source files in `web/` are bind-mounted; Vite HMR applies changes instantly

### Common Docker commands

```bash
# Start in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down

# Reset database (removes all data)
docker compose down -v
```

## Root scripts

| Script       | Description                          |
|--------------|--------------------------------------|
| `pnpm dev`   | Run api and web dev servers          |
| `pnpm dev:api` | Run NestJS in watch mode           |
| `pnpm dev:web` | Run Vite dev server                |
| `pnpm build` | Build all packages                   |
| `pnpm build:api` | Build NestJS app                 |
| `pnpm build:web` | Build frontend for production    |

## Environment variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable         | Default              | Description                    |
|------------------|----------------------|--------------------------------|
| `DB_HOST`        | `postgres` / `localhost` | PostgreSQL host            |
| `DB_PORT`        | `5432`               | PostgreSQL port                |
| `DB_USER`        | `homekit`            | Database user                  |
| `DB_PASSWORD`    | `homekit`            | Database password              |
| `DB_NAME`        | `homekit`            | Database name                  |
| `PORT`           | `3000`               | API server port                |
| `VITE_API_URL`   | `http://localhost:3000` | API URL for frontend       |

## Notes

- TypeORM `synchronize: true` is enabled for local development only. Do not use in production.
- Package-specific docs: [api/README.md](api/README.md), [web/README.md](web/README.md).
