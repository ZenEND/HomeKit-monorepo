# API — NestJS Backend

TypeScript NestJS application. REST + WebSocket. PostgreSQL via TypeORM. Redis for game state.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 |
| Database | PostgreSQL 16 via TypeORM 0.3 |
| Cache / Game State | Redis 7 via ioredis |
| Real-time | Socket.io 4 (`@nestjs/websockets`) |
| Auth | JWT + Passport |
| File uploads | Multer |
| AI | Google Gemini / Groq / OpenRouter / HuggingFace / Cerebras |
| API docs | Swagger (`@nestjs/swagger`) at `/api` |

---

## Local development

```bash
# Start infrastructure (Postgres + Redis) — no rebuild needed
docker compose up postgres redis -d

# Copy env and start API in watch mode
cp packages/api/.env.example packages/api/.env
pnpm dev:api   # → http://localhost:3000
```

On first start TypeORM auto-creates all tables (`synchronize: true`). The seed
service creates the admin user from `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

---

## Module map

```
src/
├── main.ts                    # Bootstrap, CORS, Swagger, global pipes
├── app.module.ts              # Root module
├── app.controller.ts          # GET / health check
│
├── database/
│   ├── database.module.ts     # TypeORM config (sync in dev, migrations in prod)
│   ├── database.seed.service.ts # Admin seed + optional Munchkin card seed
│   ├── database.controller.ts # POST/DELETE /dev/seed/cards (admin only)
│   ├── data-source.ts         # TypeORM CLI config (migration commands only)
│   └── migrations/            # Generated migration files (committed to git)
│
├── auth/                      # JWT + local strategy, login, token refresh
├── users/                     # User entity, roles, CRUD
│
├── cards/                     # Munchkin card library
│   ├── card.entity.ts         # TypeORM entity with diceRollConfig, situationText
│   ├── cards.service.ts       # CRUD + upsert
│   └── cards.controller.ts    # GET/POST/PATCH/DELETE /admin/cards
│
├── effects/                   # Effect definitions (static registry, no DB)
├── carry-effects/             # Cross-game carry effects (stored in DB)
│
├── game/                      # Real-time multiplayer
│   ├── redis.service.ts       # All Redis operations (lock, presence, pub/sub…)
│   ├── room-manager.service.ts # Room lifecycle + action hot path
│   ├── game.gateway.ts        # Socket.io /game namespace
│   ├── monitor.controller.ts  # REST /admin/monitor endpoints
│   ├── game.module.ts
│   └── utils.ts               # generateRoomCode, nanoid
│
├── ai/                        # AI text/card/door-event generation
│   ├── ai.service.ts          # Multi-provider with fallback
│   ├── ai.controller.ts       # /ai/generate-* endpoints
│   └── providers/             # Groq, OpenRouter, HuggingFace, Cerebras, Google
│
├── files/                     # File upload + static serving at /uploads
├── f1/                        # F1 data (unrelated feature)
└── plans/                     # Media plan tracking (unrelated feature)
```

---

## REST API

Swagger UI at **[http://localhost:3000/api](http://localhost:3000/api)**.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Email + password → JWT access token |
| `GET` | `/auth/me` | Current user info |

### Cards (admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/cards` | List cards (filter by type/subtype/status/game/tag) |
| `POST` | `/admin/cards` | Create card |
| `GET` | `/admin/cards/:id` | Get single card |
| `PATCH` | `/admin/cards/:id` | Update card |
| `DELETE` | `/admin/cards/:id` | Delete card |
| `POST` | `/admin/cards/:id/duplicate` | Clone a card |

### AI

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ai/generate-card-fields` | Pre-fill card form from a description |
| `POST` | `/ai/generate-door-event` | Generate full Door Event card with dice tiers |
| `GET` | `/ai/models/health` | Check which AI providers are available |

### Game Monitor (admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/monitor/rooms` | List all active game rooms |
| `GET` | `/admin/monitor/rooms/:id` | Room details + live state |
| `POST` | `/admin/monitor/rooms/:id/end` | Force-end a game |
| `POST` | `/admin/monitor/rooms/:id/kick` | Kick a player |
| `POST` | `/admin/monitor/rooms/:id/inject-card` | Give a card to a player |

### Dev seeds (admin, dev only)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/dev/seed/cards` | Seed all Munchkin cards into DB |
| `DELETE` | `/dev/seed/cards` | Remove all seeded Munchkin cards |

---

## WebSocket — `/game` namespace

Full documentation: [`docs/sockets.md`](../../docs/sockets.md)

### Quick reference

**Client → Server:**
`CREATE_ROOM` · `JOIN_ROOM` · `LEAVE_ROOM` · `START_GAME` · `GAME_ACTION` ·
`RECONNECT` · `HEARTBEAT` · `CHAT_MESSAGE` · `GET_CHAT_HISTORY` · `EMOTE`

**Server → Client:**
`ROOM_CREATED` · `ROOM_JOINED` · `PLAYER_JOINED` · `PLAYER_LEFT` ·
`PLAYER_DISCONNECTED` · `GAME_STARTED` · `STATE_PATCH` · `FULL_STATE` ·
`GAME_OVER` · `ANIMATION_TRIGGER` · `PRESENCE_UPDATE` ·
`CHAT_MESSAGE` · `CHAT_HISTORY` · `SYSTEM_MESSAGE` · `ERROR`

---

## Database

### Development (default)

TypeORM `synchronize: true` — schema auto-updates on every startup. No migration
files needed. Just add/change entity columns and restart.

```bash
# Force a clean DB (drops all data)
docker compose down -v
docker compose up postgres redis -d
pnpm dev:api
```

### Seeding Munchkin cards

```bash
# Option 1 — set in .env, seed happens on next startup
SEED_CARDS=true  # in packages/api/.env

# Option 2 — via API (after login as admin)
POST /dev/seed/cards
```

### Production migrations

When `NODE_ENV=production`, `synchronize` is disabled. Use the CLI to generate
migration files after changing entities:

```bash
# After changing an entity file:
cd packages/api
pnpm build
pnpm migration:generate -- src/database/migrations/AddPresenceColumn
# review the generated file, then commit

# Run migrations manually:
pnpm migration:run

# Revert last migration:
pnpm migration:revert
```

Set `RUN_MIGRATIONS=true` in production env to auto-run pending migrations on
API startup.

---

## Environment variables

Copy `packages/api/.env.example` to `packages/api/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `production` disables synchronize |
| `PORT` | `3000` | HTTP + WebSocket port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `homekit` | DB username |
| `DB_PASSWORD` | `homekit` | DB password |
| `DB_NAME` | `homekit` | Database name |
| `DB_LOGGING` | — | Set `true` to log all SQL queries |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `JWT_KEY` | `change-me-in-production` | JWT signing secret |
| `JWT_EXPIRES` | `1d` | Token expiry |
| `ADMIN_EMAIL` | `admin@homekit.local` | Admin user email (seeded on startup) |
| `ADMIN_PASSWORD` | `admin123456` | Admin user password |
| `SEED_CARDS` | — | Set `true` to seed Munchkin cards on startup |
| `RUN_MIGRATIONS` | — | Set `true` to run migrations on startup (production) |
| `GROQ_API_KEY` | — | Groq API key (fast models) |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `OPENROUTER_API_KEY` | — | OpenRouter (access to many models) |
| `HUGGINGFACE_API_KEY` | — | HuggingFace Inference API |
| `CEREBRAS_API_KEY` | — | Cerebras fast inference |

---

## Scripts

Run from `packages/api/`:

| Script | Description |
|--------|-------------|
| `pnpm start:dev` | Watch mode (Nest recompiles on save) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start:prod` | Run compiled app (`dist/main.js`) |
| `pnpm migration:generate` | Generate migration from entity diff |
| `pnpm migration:run` | Apply pending migrations |
| `pnpm migration:revert` | Revert last migration |
| `pnpm migration:show` | List applied/pending migrations |

Or from the repo root:

| Script | Description |
|--------|-------------|
| `pnpm dev:api` | Build engine/types, then `start:dev` |
| `pnpm build:api` | Build engine/types, then `nest build` |

---

## Redis key schema

See [`docs/game-module.md`](../../docs/game-module.md) for the full Redis guide.

| Key pattern | Type | TTL | Contents |
|-------------|------|-----|---------|
| `room:{id}:state` | STRING | 24 h | Full `MunchkinGameState` JSON |
| `room:{id}:info` | STRING | 24 h | `RoomInfo` metadata |
| `room:{id}:patches` | LIST | 24 h | Last 50 JSON patches |
| `room:{id}:lock` | STRING | 300 ms | Distributed write lock |
| `room:{id}:presence` | HASH | 24 h | `playerId → last_seen_ms` |
| `room:{id}:chat` | LIST | 24 h | Last 100 chat messages |
| `rooms:active` | SET | — | All active room IDs |
| `roomcode:{code}` | STRING | 24 h | Room code → room ID |
| `rl:{room}:{pid}` | ZSET | 1 s | Rate limit sliding window |
| `game:events:{id}` | CHANNEL | — | Pub/Sub for multi-instance sync |

---

## Docker

```bash
# Infrastructure only (preferred for development)
docker compose up postgres redis -d

# Full stack (all services in containers)
docker compose up --build
```

API source is bind-mounted (`packages/api/` → `/app/packages/api/`) so Nest's
watch mode picks up changes without container restarts.
