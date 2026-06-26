import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { MunchkinGameState } from '@homekit/engine';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROOM_TTL_S = 60 * 60 * 24;       // 24 h  — room state & metadata
const LOCK_TTL_MS = 300;                // 300 ms — max time to hold a state-write lock
const PATCH_HISTORY_SIZE = 50;          // keep last 50 JSON-patch entries per room
const CHAT_HISTORY_SIZE = 100;          // keep last 100 chat messages per room
const PRESENCE_ONLINE_THRESHOLD_MS = 30_000; // 30 s without heartbeat = offline

// ── Key factory (single source of truth for all Redis key shapes) ─────────────

export const Keys = {
  /** Full serialised MunchkinGameState */
  state: (roomId: string) => `room:${roomId}:state`,
  /** Lightweight room metadata (players, host, phase…) */
  info: (roomId: string) => `room:${roomId}:info`,
  /** LIST of last N JSON-patch entries (for catch-up on reconnect) */
  patches: (roomId: string) => `room:${roomId}:patches`,
  /** Distributed write-lock (SET NX PX) */
  lock: (roomId: string) => `room:${roomId}:lock`,
  /** HASH playerId → last_seen_ms (presence heartbeats) */
  presence: (roomId: string) => `room:${roomId}:presence`,
  /** LIST of last N chat messages */
  chat: (roomId: string) => `room:${roomId}:chat`,
  /** SET of all active room IDs (used by monitor / admin) */
  activeRooms: () => `rooms:active`,
  /** Short room code → roomId mapping */
  roomCode: (code: string) => `roomcode:${code}`,
  /** Sorted Set for sliding-window rate limiting per player per room */
  rateLimit: (playerId: string, roomId: string) => `rl:${roomId}:${playerId}`,
  /** Pub/Sub channel for cross-instance event broadcasting */
  events: (roomId: string) => `game:events:${roomId}`,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  playerId: string;
  playerName: string;
  text: string;
  ts: number;
}

export interface GameRoomEvent {
  type: string;
  roomId: string;
  payload: unknown;
  ts: number;
}

export interface PresenceMap {
  /** playerId → last-seen timestamp (ms) */
  [playerId: string]: number;
}

// ── Lua scripts (atomic operations executed server-side in Redis) ─────────────

/**
 * Release a distributed lock only if the token matches.
 * Prevents accidental release of a lock held by a different owner.
 */
const LUA_RELEASE_LOCK = `
  if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
  else
    return 0
  end
`;

/**
 * Sliding-window rate limiter.
 * Uses a Sorted Set where each member is the action timestamp.
 * Returns [allowed:0|1, remaining:number].
 */
const LUA_RATE_LIMIT = `
  local key          = KEYS[1]
  local now          = tonumber(ARGV[1])
  local window_start = tonumber(ARGV[2])
  local max_actions  = tonumber(ARGV[3])
  local window_ms    = tonumber(ARGV[4])

  -- evict entries older than the window
  redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

  local count = redis.call('ZCARD', key)
  if count >= max_actions then
    return {0, 0}
  end

  -- add this request (score = timestamp, member = timestamp:random to avoid collision)
  redis.call('ZADD', key, now, now .. ':' .. math.random(1, 1000000))
  redis.call('PEXPIRE', key, window_ms)

  return {1, max_actions - count - 1}
`;

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  /** Main client — commands + pub/sub publishing */
  private client: Redis;
  /** Dedicated subscriber client (cannot share with command client once subscribed) */
  private subscriber: Redis;

  constructor(private readonly config: ConfigService) {}

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  onModuleInit(): void {
    const url = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    const opts = { lazyConnect: true, maxRetriesPerRequest: 3, enableReadyCheck: true };

    this.client = new Redis(url, opts);
    this.subscriber = new Redis(url, opts);

    this.client.on('error', (err) => this.logger.error('Redis client error', err));
    this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error', err));

    this.client.connect().catch((e) => this.logger.warn('Redis connect failed', e));
    this.subscriber.connect().catch((e) => this.logger.warn('Redis subscriber connect failed', e));
  }

  onModuleDestroy(): void {
    this.client?.disconnect();
    this.subscriber?.disconnect();
  }

  // ── Health ──────────────────────────────────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  // ── Room State ──────────────────────────────────────────────────────────────

  async setRoomState(roomId: string, state: MunchkinGameState): Promise<void> {
    await this.client.setex(Keys.state(roomId), ROOM_TTL_S, JSON.stringify(state));
    await this.client.sadd(Keys.activeRooms(), roomId);
  }

  async getRoomState(roomId: string): Promise<MunchkinGameState | null> {
    const data = await this.client.get(Keys.state(roomId));
    return data ? (JSON.parse(data) as MunchkinGameState) : null;
  }

  /**
   * Atomically persist state + append patch in a single pipeline.
   * One TCP roundtrip instead of two separate calls.
   */
  async saveStateAndPatch(
    roomId: string,
    state: MunchkinGameState,
    patch: unknown[],
  ): Promise<void> {
    const pipeline = this.client.pipeline();

    pipeline.setex(Keys.state(roomId), ROOM_TTL_S, JSON.stringify(state));
    pipeline.rpush(Keys.patches(roomId), JSON.stringify({ patch, ts: Date.now() }));
    pipeline.ltrim(Keys.patches(roomId), -PATCH_HISTORY_SIZE, -1);
    pipeline.expire(Keys.patches(roomId), ROOM_TTL_S);
    pipeline.sadd(Keys.activeRooms(), roomId);

    await pipeline.exec();
  }

  async getRecentPatches(roomId: string, limit = 20): Promise<unknown[][]> {
    const entries = await this.client.lrange(Keys.patches(roomId), -limit, -1);
    return entries.map((e) => (JSON.parse(e) as { patch: unknown[] }).patch);
  }

  async deleteRoom(roomId: string): Promise<void> {
    const pipeline = this.client.pipeline();
    pipeline.del(Keys.state(roomId));
    pipeline.del(Keys.patches(roomId));
    pipeline.del(Keys.presence(roomId));
    pipeline.del(Keys.chat(roomId));
    pipeline.srem(Keys.activeRooms(), roomId);
    await pipeline.exec();
  }

  // ── Room Info (metadata) ────────────────────────────────────────────────────

  async setRoomInfo<T>(roomId: string, info: T): Promise<void> {
    await this.client.setex(Keys.info(roomId), ROOM_TTL_S, JSON.stringify(info));
  }

  async getRoomInfo<T>(roomId: string): Promise<T | null> {
    const data = await this.client.get(Keys.info(roomId));
    return data ? (JSON.parse(data) as T) : null;
  }

  // ── Room Codes ──────────────────────────────────────────────────────────────

  async setRoomCode(code: string, roomId: string): Promise<void> {
    await this.client.setex(Keys.roomCode(code), ROOM_TTL_S, roomId);
  }

  async getRoomIdByCode(code: string): Promise<string | null> {
    return this.client.get(Keys.roomCode(code));
  }

  async deleteRoomCode(code: string): Promise<void> {
    await this.client.del(Keys.roomCode(code));
  }

  async getAllRoomIds(): Promise<string[]> {
    return this.client.smembers(Keys.activeRooms());
  }

  // ── Distributed Lock ────────────────────────────────────────────────────────

  /**
   * Try to acquire an exclusive write lock for a room.
   *
   * Uses Redis SET NX PX — atomic "set if not exists with expiry".
   * If two requests arrive simultaneously, only one will get the lock.
   * The loser should retry after a short backoff.
   *
   * @param token  Unique token (e.g. nanoid) that only the lock owner can release.
   * @param ttlMs  Auto-release after this many ms (safety net if owner crashes).
   */
  async acquireLock(roomId: string, token: string, ttlMs = LOCK_TTL_MS): Promise<boolean> {
    const result = await this.client.set(
      Keys.lock(roomId),
      token,
      'PX', ttlMs,
      'NX',
    );
    return result === 'OK';
  }

  /**
   * Acquire lock with automatic retry.
   * Retries up to `maxRetries` times with exponential back-off.
   */
  async acquireLockWithRetry(
    roomId: string,
    token: string,
    maxRetries = 5,
    baseDelayMs = 20,
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      if (await this.acquireLock(roomId, token)) return true;
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, i)));
    }
    return false;
  }

  /**
   * Release a lock only if the token matches the current holder.
   * Uses a Lua script to make the check+delete atomic.
   */
  async releaseLock(roomId: string, token: string): Promise<void> {
    await this.client.eval(LUA_RELEASE_LOCK, 1, Keys.lock(roomId), token);
  }

  // ── Player Presence ─────────────────────────────────────────────────────────

  /**
   * Record a heartbeat for a player.
   * Call this on every Socket.io connection and periodically (e.g. every 15 s).
   */
  async heartbeat(roomId: string, playerId: string): Promise<void> {
    await this.client.hset(Keys.presence(roomId), playerId, Date.now().toString());
    await this.client.expire(Keys.presence(roomId), ROOM_TTL_S);
  }

  /**
   * Mark a player as offline by removing them from the presence hash.
   */
  async clearPresence(roomId: string, playerId: string): Promise<void> {
    await this.client.hdel(Keys.presence(roomId), playerId);
  }

  /** Returns all player IDs currently in the room with their last-seen timestamps. */
  async getPresenceMap(roomId: string): Promise<PresenceMap> {
    const raw = await this.client.hgetall(Keys.presence(roomId));
    const result: PresenceMap = {};
    for (const [pid, ts] of Object.entries(raw ?? {})) {
      result[pid] = parseInt(ts, 10);
    }
    return result;
  }

  /** Returns player IDs who sent a heartbeat within the last `thresholdMs`. */
  async getOnlinePlayers(
    roomId: string,
    thresholdMs = PRESENCE_ONLINE_THRESHOLD_MS,
  ): Promise<string[]> {
    const map = await this.getPresenceMap(roomId);
    const now = Date.now();
    return Object.entries(map)
      .filter(([, ts]) => now - ts < thresholdMs)
      .map(([pid]) => pid);
  }

  // ── Rate Limiting (Redis-backed sliding window) ──────────────────────────────

  /**
   * Sliding-window rate limiter implemented entirely in Lua running on Redis.
   * Works correctly even with multiple API instances because the state lives in Redis.
   *
   * @param maxActions  Max actions allowed in the window.
   * @param windowMs    Window duration in milliseconds.
   * @returns `{ allowed, remaining }` — remaining = slots left in this window.
   */
  async checkRateLimit(
    playerId: string,
    roomId: string,
    maxActions = 10,
    windowMs = 1000,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    const result = await this.client.eval(
      LUA_RATE_LIMIT,
      1,
      Keys.rateLimit(playerId, roomId),
      now.toString(),
      windowStart.toString(),
      maxActions.toString(),
      windowMs.toString(),
    ) as [number, number];

    return { allowed: result[0] === 1, remaining: result[1] };
  }

  // ── Chat History ─────────────────────────────────────────────────────────────

  async pushChatMessage(roomId: string, message: ChatMessage): Promise<void> {
    const pipeline = this.client.pipeline();
    pipeline.rpush(Keys.chat(roomId), JSON.stringify(message));
    pipeline.ltrim(Keys.chat(roomId), -CHAT_HISTORY_SIZE, -1);
    pipeline.expire(Keys.chat(roomId), ROOM_TTL_S);
    await pipeline.exec();
  }

  async getChatHistory(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const entries = await this.client.lrange(Keys.chat(roomId), -limit, -1);
    return entries.map((e) => JSON.parse(e) as ChatMessage);
  }

  // ── Pub / Sub (cross-instance event broadcasting) ───────────────────────────

  /**
   * Publish a game event to all API instances subscribed to this room's channel.
   * This is the mechanism that lets horizontally-scaled instances broadcast to
   * their own Socket.io connections.
   */
  async publishEvent(event: GameRoomEvent): Promise<void> {
    await this.client.publish(Keys.events(event.roomId), JSON.stringify(event));
  }

  /**
   * Subscribe to a room's event channel.
   * Returns an unsubscribe function — call it when the room closes.
   */
  async subscribeToRoom(
    roomId: string,
    handler: (event: GameRoomEvent) => void,
  ): Promise<() => Promise<void>> {
    const channel = Keys.events(roomId);
    await this.subscriber.subscribe(channel);

    const onMessage = (ch: string, message: string) => {
      if (ch === channel) {
        try { handler(JSON.parse(message) as GameRoomEvent); } catch { /* ignore malformed */ }
      }
    };
    this.subscriber.on('message', onMessage);

    return async () => {
      this.subscriber.off('message', onMessage);
      await this.subscriber.unsubscribe(channel);
    };
  }

  // ── Raw client access ────────────────────────────────────────────────────────

  /** Escape hatch for one-off commands not covered by the typed API above. */
  getClient(): Redis {
    return this.client;
  }
}
