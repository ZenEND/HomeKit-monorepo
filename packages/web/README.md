# Web — React Frontend

React 19 + Vite 6 single-page application. Tailwind CSS 4. TypeScript.
Home management dashboard + multiplayer board game client.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite 6 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) + CSS Modules (`.module.scss`) |
| Routing | React Router 7 (lazy-loaded pages) |
| State | Zustand 5 |
| Animations | Framer Motion (`motion/react`) |
| Particles | `@tsparticles/react` + `@tsparticles/slim` |
| Real-time | `socket.io-client` |
| State diff | `fast-json-patch` |
| HTTP | Axios |
| Game engine | `@homekit/engine` (workspace, resolved from source) |

---

## Local development

```bash
# From repo root
pnpm dev:web   # → http://localhost:5173
```

Vite HMR applies changes instantly — no restart needed. The `@homekit/engine`
and `@homekit/types` packages are resolved directly from their TypeScript source
via `vite.config.ts` aliases, so engine changes are reflected immediately.

---

## Project structure

```
web/src/
│
├── main.tsx                     # App entry point
├── router.tsx                   # All routes (lazy imports)
│
├── components/
│   ├── base/                    # Design system: Input, Select, Avatar, Tags…
│   ├── layouts/
│   │   ├── BaseLayout/          # Shell with SideNav + header
│   │   └── SideNav/             # Collapsible sidebar with admin sub-menu
│   ├── shared/                  # Skeleton, PageTransition, ThemeSwitcher…
│   ├── form/                    # Form wrappers (FormCheckbox, FormInput…)
│   ├── game/                    # Shared game UI (CardFace)
│   └── webgl/                   # Three.js / particle background components
│
├── features/
│   ├── munchkin/
│   │   ├── hooks/
│   │   │   ├── useGameSocket.ts # Socket.io connection + action emitters
│   │   │   └── useGameState.ts  # Zustand store + selectors
│   │   └── components/
│   │       ├── Dice3D.tsx            # CSS 3D d6 cube with landing animation
│   │       ├── DoorEventOverlay.tsx  # Full-screen Door Event / dice roll UI
│   │       ├── CardComponent.tsx     # Single card with flip animation
│   │       ├── CardHand.tsx          # Fan layout hand
│   │       ├── PlayerSeat.tsx        # Avatar + level ring + stats
│   │       ├── CombatPanel.tsx       # Combat actions + help/hinder buttons
│   │       ├── PhasePanel.tsx        # Phase-specific action buttons
│   │       ├── EffectOverlay.tsx     # tsparticles effects on game events
│   │       ├── LevelUpCelebration.tsx# Full-screen level-up animation
│   │       └── EventLog.tsx          # Scrolling event ticker
│   ├── admin/
│   │   └── sync-sources.ts          # Admin enrichment source config
│   └── plans/
│       └── hooks/                    # Media-plan data hooks
│
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── login.tsx
│   ├── munchkin/
│   │   ├── Lobby.tsx      # Create / join room, player list, start game
│   │   ├── Game.tsx       # Main 2D game view (all components wired together)
│   │   └── Spectator.tsx  # Read-only view with auto-reconnect
│   ├── admin/
│   │   ├── index.tsx          # Admin dashboard
│   │   ├── cards/
│   │   │   ├── index.tsx      # Card library (search, filter, duplicate, delete)
│   │   │   └── new.tsx        # Card creator (AI pre-fill, effects, live preview)
│   │   ├── door-events/
│   │   │   └── index.tsx      # Door Event creator (AI generate, dice tiers)
│   │   ├── carry-effects/
│   │   │   └── index.tsx      # Cross-game carry effects
│   │   └── monitor/
│   │       └── index.tsx      # Live game monitor (rooms, players, admin actions)
│   ├── plans/                 # Media planning feature
│   ├── f1.tsx                 # F1 data viewer
│   ├── games.tsx
│   └── …
│
└── store/
    ├── useUserStore.ts        # Authenticated user
    ├── useThemeStore.ts       # Dark / light theme
    ├── useAppStore.ts         # App-wide state (health, etc.)
    ├── useFilesStore.ts       # Uploaded files
    └── useTooltipStore.ts     # Tooltip visibility
```

---

## Routing

All routes in `src/router.tsx`. Pages are **lazy-loaded** with `React.lazy` to
keep the initial bundle small.

### Public routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Dashboard home |
| `/about` | `About` | About page |
| `/login` | `LoginPage` | Auth form |
| `/munchkin` | `Lobby` | Game lobby (create / join room) |
| `/munchkin/spectator/:code` | `Spectator` | Read-only spectator by room code |

### Protected routes (requires login)

| Path | Component | Description |
|------|-----------|-------------|
| `/munchkin/game/:roomId` | `Game` | Active game view |
| `/admin` | `AdminIndex` | Admin dashboard |
| `/admin/cards` | `AdminCards` | Card library |
| `/admin/cards/new` | `NewCard` | Card creator |
| `/admin/door-events` | `DoorEventCreator` | Door Event card creator |
| `/admin/carry-effects` | `CarryEffects` | Cross-game effects |
| `/admin/monitor` | `GameMonitor` | Live game monitor |

---

## Real-time game (Socket.io)

Full documentation: [`docs/sockets.md`](../../docs/sockets.md)

### useGameSocket

The single hook for all Socket.io interaction:

```typescript
const { createRoom, joinRoom, startGame, sendAction, reconnect, on } =
  useGameSocket({
    playerId: user.id,
    playerName: user.name,
    onAnimationTrigger: (t) => setActiveEffect(t),
    onError: (code, msg) => toast.error(msg),
  });

// Send a Munchkin game action
sendAction(roomId, { type: 'KICK_DOOR' });
sendAction(roomId, { type: 'ROLL_DICE' });
sendAction(roomId, { type: 'RESOLVE_DOOR_EVENT' });

// Subscribe to any server event
const unsub = on<{ online: string[] }>('PRESENCE_UPDATE', ({ online }) => {
  setOnlinePlayers(online);
});
```

### useGameState

Zustand store with typed selectors:

```typescript
// Selectors (use individually to avoid unnecessary re-renders)
const phase = usePhase();
const players = useAllPlayers();
const myHand = useMyHand(playerId);
const combat = useCombatStack();
const diceRoll = useDiceRollState(); // null or DiceRollState during DOOR_EVENT phase
```

### State sync model

1. `GAME_STARTED` / `RECONNECT` → full `MunchkinGameState` replaces local state
2. `STATE_PATCH` → JSON Patch applied with `fast-json-patch` (< 500 bytes per action)
3. Client never mutates state locally — server is always the source of truth

---

## Munchkin game components

### Dice3D

CSS 3D cube with all 6 faces. Pass `rolling={true}` to spin, then set `result`
to animate it landing on a specific face.

```tsx
<Dice3D size={100} rolling={isRolling} result={4} onRollComplete={handleDone} />

// Multiple dice
<DiceGroup count={2} size={80} results={[4, 5]} rolling={false} onAllComplete={applyResult} />
```

### DoorEventOverlay

Full-screen modal for Door Event cards. Shown automatically when
`phase === 'DOOR_EVENT'` and `state.diceRollState !== null`.

```tsx
<DoorEventOverlay
  diceRollState={state.diceRollState}
  isActivePlayer={myId === state.activePlayerId}
  onRoll={() => sendAction(roomId, { type: 'ROLL_DICE' })}
  onResolve={() => sendAction(roomId, { type: 'RESOLVE_DOOR_EVENT' })}
/>
```

### EffectOverlay

Particle effects triggered by game events (level-up, combat win, curse…).
Uses `@tsparticles/react` v3 with `initParticlesEngine` called once globally.

```tsx
<EffectOverlay trigger={activeEffect} />  // AnimationTrigger | null
```

---

## Admin panel

### Card creator (`/admin/cards/new`)

Three-column layout: form → live preview → effects panel.

- **AI pre-fill** (`POST /ai/generate-card-fields`) — type a description, AI fills name/description/flavorText.
- **Image upload** with crop modal (Multer + canvas).
- **Effects picker** — uses the `EffectRegistry` from `@homekit/engine`.
- **GM Approval** toggle — card goes into review queue.

### Door Event creator (`/admin/door-events`)

- **AI generation** (`POST /ai/generate-door-event`) — type a seed concept and
  tone, AI generates full card with 5 outcome tiers.
- **Manual tier editor** — configure minRoll/maxRoll, description, effects, animation per tier.
- **Live preview** panel.
- **Save** → `POST /admin/cards` with `type: 'DOOR_EVENT'` and `diceRollConfig`.

### Game monitor (`/admin/monitor`)

- Lists all active rooms from Redis (`GET /admin/monitor/rooms`).
- Shows live phase, round, players, presence.
- Admin actions: Force End, Kick Player, Inject Card.

---

## Styling

### Tailwind CSS 4

Configured via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed).
Design tokens use CSS custom properties (`--color-brand-primary` etc.) defined
in the global stylesheet.

```tsx
<div className="flex items-center gap-3 rounded-2xl bg-secondary/20 p-4">
```

### CSS Modules

`.module.scss` files for component-scoped styles:

```tsx
import styles from './Card.module.scss';
<div className={styles.cardFlip} />
```

Class names exported in `camelCaseOnly` (configured in `vite.config.ts`).

### Theming

`useThemeStore` toggles `dark` class on `<html>`. All colours are CSS variables:
`bg-primary`, `text-secondary`, `border-secondary/40` etc. Framer Motion
animations automatically respect `prefers-reduced-motion`.

---

## Path aliases

| Alias | Resolves to |
|-------|-------------|
| `@/` | `src/` |
| `@homekit/engine` | `../engine/src/index.ts` (source, no build step) |
| `@homekit/types` | `../types/src/index.ts` (source, no build step) |

```tsx
import { useGameStore } from '@/features/munchkin/hooks/useGameState';
import type { MunchkinCard } from '@homekit/engine';
```

---

## Environment variables

Set in `packages/web/.env` (or repo root `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL (REST + WebSocket) |

---

## Scripts

Run from `packages/web/` or via root scripts:

| Script | Description |
|--------|-------------|
| `pnpm dev` | Vite dev server on port 5173 |
| `pnpm build` | Type-check + production build to `dist/` |
| `pnpm preview` | Serve the production build locally |

Root shortcuts:

| Script | Description |
|--------|-------------|
| `pnpm dev:web` | Build engine/types then start Vite dev |
| `pnpm build:web` | Build engine/types then production build |

---

## Docker

```bash
# Run frontend in container (binds source for HMR)
docker compose up web --build

# Or just run infra + start Vite on host (faster)
docker compose up postgres redis -d
pnpm dev:web
```

Source is bind-mounted in the container — Vite HMR works inside Docker without
rebuilding the image on code changes.
