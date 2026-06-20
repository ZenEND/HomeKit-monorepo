# API (NestJS)

Minimal NestJS backend with TypeORM and PostgreSQL.

## Structure

```
api/src/
├── main.ts                  # App bootstrap, CORS, port
├── app.module.ts            # Root module
├── app.controller.ts        # GET / health check
└── database/
    └── database.module.ts   # TypeORM Postgres connection
```

## Local development

```bash
# From repo root
cp api/.env.example api/.env

# Start Postgres (if not already running)
docker compose up postgres -d

# Run API
pnpm dev:api
```

Health check: [http://localhost:3000](http://localhost:3000)

```json
{
  "status": "ok",
  "service": "api",
  "database": "connected",
  "timestamp": "..."
}
```

## Environment variables

Copy `api/.env.example` to `api/.env`:

| Variable      | Default     | Description        |
|---------------|-------------|--------------------|
| `PORT`        | `3000`      | Server port        |
| `DB_HOST`     | `localhost` | PostgreSQL host    |
| `DB_PORT`     | `5432`      | PostgreSQL port    |
| `DB_USER`     | `homekit`   | Database user      |
| `DB_PASSWORD` | `homekit`   | Database password  |
| `DB_NAME`     | `homekit`   | Database name      |

When running via Docker Compose, `DB_HOST` is set to `postgres` automatically.

## Scripts

| Script            | Description              |
|-------------------|--------------------------|
| `pnpm start:dev`  | Dev server with watch    |
| `pnpm build`      | Compile to `dist/`       |
| `pnpm start:prod` | Run compiled app         |

## Docker

The API runs as part of the root compose stack:

```bash
docker compose up api --build
```

Source code in `api/` is bind-mounted for hot reload via Nest watch mode.

## Adding entities

Create entities under `src/` and register them via TypeORM decorators. With `autoLoadEntities: true`, they are picked up automatically.

**Note:** `synchronize: true` is enabled for development. Use migrations for production.
