# Socket.io Architecture

> Real-time communication layer for the multiplayer game system.

---

## Table of Contents

1. [Overview](#overview)
2. [Transport & Connection](#transport--connection)
3. [Namespace Design](#namespace-design)
4. [Message Flow](#message-flow)
5. [State Synchronization Strategy](#state-synchronization-strategy)
6. [Rate Limiting](#rate-limiting)
7. [Presence & Heartbeat](#presence--heartbeat)
8. [Reconnection](#reconnection)
9. [Pub/Sub for Horizontal Scaling](#pubsub-for-horizontal-scaling)
10. [Client-Side Hook](#client-side-hook)
11. [Error Handling](#error-handling)
12. [Complete Event Reference](#complete-event-reference)
13. [How to Expand](#how-to-expand)

---

## Overview

The game uses **Socket.io v4** over WebSocket (with automatic long-polling fallback).
Every multiplayer interaction — kicking a door, rolling dice, chatting, viewing
presence — goes through Socket.io. HTTP/REST is used only for admin tools and
non-real-time operations (card library, user auth).

```
Browser ──── WS ────► NestJS GameGateway ──► RoomManagerService ──► Redis
                              │                                        │
                              └────────────────────────────────────────┘
                                     (pub/sub for multi-instance)
```

---

## Transport & Connection

**Server** (`packages/api/src/game/game.gateway.ts`):

```typescript
@WebSocketGateway({
  namespace: '/game',
  cors: { origin: '*', credentials: true },
  pingInterval: 10_000,   // ping every 10 s
  pingTimeout: 30_000,    // disconnect if no pong in 30 s
})
```

**Client** (`packages/web/src/features/munchkin/hooks/useGameSocket.ts`):

```typescript
io(`${VITE_API_URL}/game`, {
  autoConnect: false,        // manual connect — we connect after auth
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,   // 2 s between retries
})
```

The client uses `autoConnect: false` so the socket is created lazily and only
connected when the player actually enters the lobby or game page.

---

## Namespace Design

Currently there is **one namespace per feature domain**:

| Namespace | Purpose | Authentication |
|-----------|---------|----------------|
| `/game` | All multiplayer gameplay | None (playerId in payload) |

**Planned namespaces** (see [How to Expand](#how-to-expand)):

| Namespace | Purpose |
|-----------|---------|
| `/admin` | Live game monitor, force-end, inject cards |
| `/spectator` | Read-only room observation |

### Why a single namespace now?

During the development phase, a single `/game` namespace keeps the
implementation simple. Room isolation is achieved via **Socket.io rooms** (not
namespaces): each game room has its own Socket.io room identified by `roomId`,
and `server.to(roomId).emit(...)` broadcasts only to players in that room.

---

## Message Flow

### Creating and starting a game

```
Client A                      Server                       Redis
────────                      ──────                       ─────
emit CREATE_ROOM ───────────► createRoom()
                              setRoomInfo() ──────────────► room:{id}:info
                              setRoomCode() ──────────────► roomcode:{code}
                              heartbeat()   ──────────────► room:{id}:presence
◄─── emit ROOM_CREATED ───────
     client.join(roomId)      

Client B
emit JOIN_ROOM ─────────────► joinRoom()
                              setRoomInfo() ──────────────► room:{id}:info (updated)
                              heartbeat()   ──────────────► room:{id}:presence
◄─── emit ROOM_JOINED ────────
     client.join(roomId)      
◄─── emit PLAYER_JOINED ──────  (broadcast to all in room)

Client A
emit START_GAME ────────────► startGame()
                              buildInitialState()
                              setRoomState() ─────────────► room:{id}:state
◄─── emit GAME_STARTED ───────  (broadcast to all in room, includes full state)
```

### Applying a game action (hot path)

```
Client                        Server                       Redis
──────                        ──────                       ─────
emit GAME_ACTION              heartbeat() ───────────────► room:{id}:presence
  action: KICK_DOOR ────────► checkRateLimit() ──────────► rl:{room}:{pid} (ZSET)
                              acquireLock() ──────────────► room:{id}:lock (NX)
                              getRoomState() ─────────────► room:{id}:state
                              validateAction()
                              applyMunchkinAction()
                              jsonpatch.compare(old, new)
                              saveStateAndPatch() ────────► room:{id}:state
                                                  pipeline► room:{id}:patches
                              releaseLock() ──────────────► room:{id}:lock (DEL)
                              publishEvent() ─────────────► game:events:{id} (pub/sub)
◄─── emit STATE_PATCH ────────  (to all in room: patch[], round, phase)
◄─── emit ANIMATION_TRIGGER ──  (if last event has animationTrigger)
◄─── emit GAME_OVER ──────────  (if phase === 'GAME_OVER')
```

### Door Event (dice roll)

```
Client A                      Server
────────                      ──────
emit GAME_ACTION
  action: KICK_DOOR ────────► card.subtype === 'door_event'
                              → phase = DOOR_EVENT
                              → diceRollState set in game state
◄─── emit STATE_PATCH ────────

  (DoorEventOverlay shown)

emit GAME_ACTION
  action: ROLL_DICE ─────────► generateRoll(config.diceCount, config.diceType)
                               → resolvedTier found
                               → diceRollState.rollResult = [4, 5] etc.
◄─── emit STATE_PATCH ─────────  (client animates 3D dice to result)

emit GAME_ACTION
  action: RESOLVE_DOOR_EVENT ► applyDiceEffect(tier.effects)
                               → phase back to LOOT
◄─── emit STATE_PATCH ─────────
```

---

## State Synchronization Strategy

The server is the **single source of truth**. Clients never mutate state locally.

### Initial state

On `GAME_STARTED` and `RECONNECT`, the server sends the **full** serialized
`MunchkinGameState` object. The client replaces its entire local state.

### Delta updates

After every action, the server computes a **JSON Patch** (RFC 6902) diff between
old and new state using `fast-json-patch`:

```typescript
const patch = jsonpatch.compare(oldState, newState);
// → [{ op: "replace", path: "/players/p1/level", value: 3 }, ...]
```

The client applies the patch with the same library:

```typescript
const nextState = jsonpatch.applyPatch(
  structuredClone(currentState),
  patch,
).newDocument;
```

**Why patches instead of full state?**

A full Munchkin state with 4 players and 175+ deck cards serializes to ~40 KB.
A typical action changes 2–5 fields — the patch is ~200 bytes. Over a game of
100 actions this saves ~4 MB of bandwidth per client.

### Patch history (reconnect catch-up)

The server stores the last 50 patches in a Redis LIST. On reconnect, the server
sends the full state **plus** recent patches. If the client missed only a few
updates, it can apply them in order to verify consistency rather than re-rendering
the full state.

---

## Rate Limiting

Two layers of rate limiting protect the `GAME_ACTION` endpoint.

### Layer 1 — Redis sliding window (in RoomManagerService)

Implemented with a Lua script on a Redis Sorted Set. Each action appends a
timestamped entry; old entries outside the 1-second window are evicted before
counting.

```
Max: 10 actions per player per second
Window: 1000 ms
Key: rl:{roomId}:{playerId}
```

The Lua script runs **atomically** inside Redis — there is no race condition
between checking the count and inserting the new entry.

### Layer 2 — In-process token bucket (legacy, still present in gateway)

The gateway previously had an in-memory token bucket. This has been superseded
by the Redis-backed layer in `RoomManagerService`, which works correctly across
multiple API instances.

**Error emitted when rate limited:**

```json
{ "code": "RATE_LIMITED", "message": "Rate limit exceeded. Slow down." }
```

---

## Presence & Heartbeat

The server tracks which players are currently online using a Redis HASH per room:

```
HSET room:{id}:presence  "player_1"  "1719402000000"
```

### Client responsibilities

1. **Connect** → server calls `heartbeat()` automatically on `CREATE_ROOM`, `JOIN_ROOM`, `RECONNECT`.
2. **Every 15 seconds** → client emits `HEARTBEAT`.
3. **Any `GAME_ACTION`** → server calls `heartbeat()` as a side effect.
4. **Disconnect** → server calls `clearPresence()`, broadcasts `PLAYER_DISCONNECTED`.

### Checking who is online

A player is considered "online" if their last heartbeat was within **30 seconds**.

```typescript
const online = await redis.getOnlinePlayers(roomId); // string[]
```

After every `HEARTBEAT` or `RECONNECT`, the server broadcasts to the room:

```json
{ "event": "PRESENCE_UPDATE", "payload": { "online": ["player_1", "player_2"] } }
```

---

## Reconnection

Socket.io has built-in reconnection. On top of that, the app has **application-layer
reconnection** to restore game state.

```
1. Network drops
2. Socket.io attempts reconnect (up to 10 times, 2s delay)
3. On socket reconnect, client emits RECONNECT
4. Server reads state + last 20 patches from Redis
5. Server emits FULL_STATE → client replaces local state
6. Server calls heartbeat() → player appears online again
7. Server broadcasts PRESENCE_UPDATE to room
```

The `Spectator.tsx` page also has its own auto-reconnect loop with exponential
backoff, independent of the Socket.io reconnection.

---

## Pub/Sub for Horizontal Scaling

When a single API instance handles all connections, Socket.io rooms handle
broadcasting naturally. When running **multiple instances** behind a load
balancer, a player's socket may be on instance A while their teammate's socket
is on instance B.

The solution: whenever instance A applies an action, it publishes to a Redis
Pub/Sub channel. Instance B is subscribed and forwards the event to its own
sockets.

```
Instance A                    Redis                  Instance B
──────────                    ─────                  ──────────
GAME_ACTION received          Pub/Sub channel        subscribed since room start
applyAction()
PUBLISH game:events:{id} ──► game:events:{id} ────► onMessage()
emit STATE_PATCH                                     emit STATE_PATCH_REMOTE
  (to A's sockets)                                     (to B's sockets)
```

**Current status:** The Pub/Sub subscriber is wired in `GameGateway.subscribeRoomEvents()`.
It listens and re-emits `STATE_PATCH_REMOTE` events. For full production
horizontal scaling, you also need `socket.io-redis` adapter to sync Socket.io
room membership across instances — see [How to Expand](#socketio-redis-adapter).

---

## Client-Side Hook

`useGameSocket` (`packages/web/src/features/munchkin/hooks/useGameSocket.ts`)
wraps the socket with a stable React interface.

```typescript
const { createRoom, joinRoom, startGame, sendAction, reconnect, on } =
  useGameSocket({
    playerId: 'user_123',
    playerName: 'Alice',
    onAnimationTrigger: (trigger) => { /* play animation */ },
    onError: (code, msg) => { /* show toast */ },
  });

// Create room
createRoom({ maxPlayers: 4 });

// Join room
joinRoom('AB3K7F');

// Start game (host only)
startGame(roomId);

// Send a game action
sendAction(roomId, { type: 'KICK_DOOR' });

// Reconnect after network loss
reconnect(roomId);

// Subscribe to any event
const unsub = on<{ online: string[] }>('PRESENCE_UPDATE', ({ online }) => {
  console.log('Online:', online);
});
// cleanup: unsub()
```

State is managed separately in `useGameState.ts` (Zustand). The hook only
handles transport; the store handles state transitions.

---

## Error Handling

All errors are emitted back to the **requesting client only** (not broadcast):

```json
{ "code": "ACTION_FAILED", "message": "..." }
```

| Code | Cause |
|------|-------|
| `CREATE_ROOM_FAILED` | Room could not be created |
| `JOIN_FAILED` | Invalid code, game started, room full |
| `START_FAILED` | Not host, already started, < 2 players |
| `ACTION_FAILED` | Invalid action (wrong phase, not your turn, etc.) |
| `RATE_LIMITED` | > 10 actions/second |
| `RECONNECT_FAILED` | Room expired (> 24 h) or state missing |

The client should always listen for `ERROR` events:

```typescript
socket.on('ERROR', ({ code, message }) => {
  if (code === 'RATE_LIMITED') {
    // debounce the UI
  } else {
    showToast(message);
  }
});
```

---

## Complete Event Reference

### Client → Server

| Event | Payload | Who can send | Description |
|-------|---------|-------------|-------------|
| `CREATE_ROOM` | `{ playerId, playerName, pluginId?, settings? }` | Any | Create a new room |
| `JOIN_ROOM` | `{ roomCode, playerId, playerName }` | Any | Join by code |
| `LEAVE_ROOM` | — | Current member | Leave the room |
| `START_GAME` | `{ roomId, playerId }` | Host only | Start the game |
| `GAME_ACTION` | `{ roomId, playerId, action }` | Active player (some actions: any) | Send a `MunchkinAction` |
| `RECONNECT` | `{ roomId, playerId }` | Anyone who was in room | Restore state after disconnect |
| `HEARTBEAT` | `{ roomId, playerId }` | Any member | Confirm online presence (every 15 s) |
| `CHAT_MESSAGE` | `{ roomId, playerId, playerName, text }` | Any member | Send a chat message |
| `GET_CHAT_HISTORY` | `{ roomId }` | Any member | Request last 100 messages |
| `EMOTE` | `{ roomId, playerId, emoteId }` | Any member | Emoji reaction |

### Server → Client

| Event | Payload | Target | Description |
|-------|---------|--------|-------------|
| `ROOM_CREATED` | `{ roomId, roomCode, info }` | Creator | Room ready |
| `ROOM_JOINED` | `{ roomId, info }` | Joiner | Joined successfully |
| `PLAYER_JOINED` | `{ playerId, playerName, info }` | All in room | New player arrived |
| `PLAYER_LEFT` | `{ playerId }` | All in room | Player left voluntarily |
| `PLAYER_DISCONNECTED` | `{ playerId, roomId }` | All in room | Player lost connection |
| `GAME_STARTED` | `{ state }` | All in room | Full initial game state |
| `STATE_PATCH` | `{ patch[], round, phase }` | All in room | JSON Patch after action |
| `STATE_PATCH_REMOTE` | `{ patch[], phase, round }` | All in room | Patch from another API instance |
| `FULL_STATE` | `{ state, recentPatches[] }` | Requesting client | Full state + catch-up patches |
| `GAME_OVER` | `{ winnerId, finalState }` | All in room | Game ended |
| `ANIMATION_TRIGGER` | `AnimationTrigger` | All in room | Trigger a UI animation |
| `PRESENCE_UPDATE` | `{ online: string[] }` | All in room | Who is currently online |
| `CHAT_MESSAGE` | `{ playerId, playerName, text, ts }` | All in room | New message |
| `CHAT_HISTORY` | `{ messages[] }` | Requesting client | Last 100 messages |
| `EMOTE` | `{ playerId, emoteId }` | All in room | Emoji reaction |
| `SYSTEM_MESSAGE` | `{ text }` | All in room | Admin broadcast |
| `ERROR` | `{ code, message }` | Requesting client | Operation failed |

---

## How to Expand

### Adding a new game

The `GamePlugin` interface (`packages/engine/src/plugin/types.ts`) abstracts all
game logic. To add a second game (e.g. Alias, Dixit):

```typescript
// 1. Create packages/engine/src/games/alias/plugin.ts
export const AliasPlugin: GamePlugin<AliasGameState, AliasAction> = {
  id: 'alias',
  name: 'Alias',
  version: '1.0.0',
  // ...
};

// 2. Register it
PluginRegistry.register(AliasPlugin);

// 3. In RoomManagerService, resolve plugin by pluginId:
const plugin = PluginRegistry.get(info.pluginId); // 'alias' | 'munchkin' | ...
const state = plugin.initialState({ ... });
```

The gateway, room manager, and Redis layer are **game-agnostic** — they don't
know which game is running, they just apply actions through the plugin interface.

---

### Adding the `/admin` namespace

```typescript
@WebSocketGateway({ namespace: '/admin', cors: ... })
export class AdminGateway {
  // Admin can subscribe to any room and receive all STATE_PATCH events
  // without modifying state
}
```

The admin gateway would subscribe to room events (via Redis pub/sub) and forward
them to connected admin clients. The `MonitorController` (REST) handles
synchronous admin actions; the admin namespace handles live streaming.

---

### Adding the `/spectator` namespace

The `Spectator.tsx` page already exists with auto-reconnect. A dedicated namespace
would:

1. Receive `STATE_PATCH` (same as players)
2. Never accept `GAME_ACTION`
3. Have a separate rate limit (less strict — spectators only read)
4. Support URL-based join by room code without authentication

```typescript
@WebSocketGateway({ namespace: '/spectator', cors: ... })
export class SpectatorGateway {
  @SubscribeMessage('WATCH')
  async handleWatch(@MessageBody() { code }: { code: string }) {
    const roomId = await this.redis.getRoomIdByCode(code);
    await client.join(roomId);
    const state = await this.redis.getRoomState(roomId);
    client.emit('FULL_STATE', { state });
  }
}
```

---

### Socket.io Redis Adapter

For full multi-instance support (socket room membership sync across instances):

```bash
pnpm add @socket.io/redis-adapter
```

```typescript
// main.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

With the adapter in place, `server.to(roomId).emit(...)` automatically reaches
sockets on **all** instances, without the manual pub/sub forwarding in
`subscribeRoomEvents`.

---

### Adding typed events (type-safety for emit/on)

Socket.io v4 supports typed interfaces:

```typescript
// shared types (packages/types/src/socket-events.ts)
interface ServerToClientEvents {
  STATE_PATCH: (data: { patch: Operation[]; round: number; phase: Phase }) => void;
  GAME_OVER: (data: { winnerId: string; finalState: MunchkinGameState }) => void;
  // ...
}

interface ClientToServerEvents {
  GAME_ACTION: (data: { roomId: string; playerId: string; action: MunchkinAction }) => void;
  // ...
}

// Server
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

// Client
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('/game');
```

---

### Adding a voice/video channel

For features like "push to talk" during Rap Battle door events:

1. Use a separate WebRTC signaling channel over Socket.io.
2. Each room acts as a WebRTC peer group.
3. The Socket.io gateway relays SDP offers/answers and ICE candidates.

```
Client A ──► emit OFFER { sdp, targetId } ──► Server ──► emit OFFER to Client B
Client B ──► emit ANSWER { sdp }           ──► Server ──► emit ANSWER to Client A
```

This doesn't require any changes to the game state machine — it runs in parallel.
