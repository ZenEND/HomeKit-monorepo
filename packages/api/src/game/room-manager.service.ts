import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as jsonpatch from 'fast-json-patch';
import { MunchkinPlugin, MunchkinGameState, MunchkinAction } from '@homekit/engine';
import type { Operation } from 'fast-json-patch';
import { RedisService } from './redis.service';
import { generateRoomCode } from './utils';
import { nanoid } from './utils';

// ── Room metadata (lightweight, always in sync with state.phase) ───────────────

export interface RoomInfo {
  roomId: string;
  roomCode: string;
  pluginId: string;
  hostId: string;
  playerIds: string[];
  playerNames: Record<string, string>;
  phase: string;
  round: number;
  createdAt: number;
  startedAt: number | null;
}

const MAX_PLAYERS = 6;

@Injectable()
export class RoomManagerService {
  private readonly logger = new Logger(RoomManagerService.name);

  constructor(private readonly redis: RedisService) {}

  // ── Room Info helpers ────────────────────────────────────────────────────────

  private async getRoomInfo(roomId: string): Promise<RoomInfo> {
    const info = await this.redis.getRoomInfo<RoomInfo>(roomId);
    if (!info) throw new NotFoundException(`Room ${roomId} not found`);
    return info;
  }

  // ── Create ───────────────────────────────────────────────────────────────────

  async createRoom(
    hostId: string,
    hostName: string,
    pluginId: string,
    _settings: Record<string, unknown> = {},
  ): Promise<RoomInfo> {
    const roomId = `room_${Date.now()}_${nanoid(6)}`;
    const roomCode = generateRoomCode();

    const info: RoomInfo = {
      roomId,
      roomCode,
      pluginId,
      hostId,
      playerIds: [hostId],
      playerNames: { [hostId]: hostName },
      phase: 'WAITING',
      round: 0,
      createdAt: Date.now(),
      startedAt: null,
    };

    await this.redis.setRoomInfo(roomId, info);
    await this.redis.setRoomCode(roomCode, roomId);
    await this.redis.heartbeat(roomId, hostId);

    this.logger.log(`Room created: ${roomCode} (${roomId}) by ${hostId}`);
    return info;
  }

  // ── Join ─────────────────────────────────────────────────────────────────────

  async joinRoom(roomCode: string, playerId: string, playerName: string): Promise<RoomInfo> {
    const roomId = await this.redis.getRoomIdByCode(roomCode);
    if (!roomId) throw new NotFoundException(`Room with code ${roomCode} not found`);

    const info = await this.getRoomInfo(roomId);
    if (info.playerIds.includes(playerId)) {
      await this.redis.heartbeat(roomId, playerId);
      return info;
    }
    if (info.startedAt) throw new BadRequestException('Game has already started');
    if (info.playerIds.length >= MAX_PLAYERS) throw new BadRequestException('Room is full');

    const updated: RoomInfo = {
      ...info,
      playerIds: [...info.playerIds, playerId],
      playerNames: { ...info.playerNames, [playerId]: playerName },
    };
    await this.redis.setRoomInfo(roomId, updated);
    await this.redis.heartbeat(roomId, playerId);
    return updated;
  }

  // ── Start ────────────────────────────────────────────────────────────────────

  async startGame(roomId: string, requestingPlayerId: string): Promise<MunchkinGameState> {
    const info = await this.getRoomInfo(roomId);
    if (info.hostId !== requestingPlayerId) throw new BadRequestException('Only the host can start the game');
    if (info.startedAt) throw new BadRequestException('Game has already started');
    if (info.playerIds.length < 2) throw new BadRequestException('At least 2 players required');

    const state = MunchkinPlugin.initialState({
      roomId,
      playerIds: info.playerIds,
      playerNames: info.playerNames,
      settings: {},
    });

    // Persist state + update room info atomically
    await Promise.all([
      this.redis.setRoomState(roomId, state),
      this.redis.setRoomInfo(roomId, { ...info, startedAt: Date.now(), phase: state.phase }),
    ]);

    return state;
  }

  // ── Apply Action (hot path — uses distributed lock) ───────────────────────────

  async applyAction(
    roomId: string,
    playerId: string,
    action: MunchkinAction,
  ): Promise<{ patch: Operation[]; newState: MunchkinGameState }> {
    // 1. Redis-backed sliding window rate limit (10 actions / second per player)
    const { allowed } = await this.redis.checkRateLimit(playerId, roomId, 10, 1000);
    if (!allowed) {
      throw new BadRequestException('Rate limit exceeded. Slow down.');
    }

    // 2. Acquire distributed write-lock to prevent concurrent state corruption
    const lockToken = nanoid(16);
    const locked = await this.redis.acquireLockWithRetry(roomId, lockToken);
    if (!locked) {
      throw new BadRequestException('Room is busy, please retry');
    }

    try {
      // 3. Read current state
      const state = await this.redis.getRoomState(roomId);
      if (!state) throw new NotFoundException(`Room ${roomId} state not found`);

      // 4. Validate + apply game logic
      const validation = MunchkinPlugin.validateAction(state, action, playerId);
      if (!validation.valid) throw new BadRequestException(validation.reason ?? 'Invalid action');

      const newState = MunchkinPlugin.applyAction(state, action, {
        playerId,
        timestamp: Date.now(),
        random: Math.random,
      });

      // 5. Compute patch
      const patch = jsonpatch.compare(
        state as unknown as Record<string, unknown>,
        newState as unknown as Record<string, unknown>,
      );

      // 6. Pipeline: save state + append patch in one roundtrip
      await this.redis.saveStateAndPatch(roomId, newState, patch);

      // 7. Update lightweight room info (non-critical)
      this.redis
        .getRoomInfo<RoomInfo>(roomId)
        .then((info) => {
          if (info) {
            return this.redis.setRoomInfo(roomId, {
              ...info,
              phase: newState.phase,
              round: newState.round,
            });
          }
        })
        .catch(() => { /* non-critical */ });

      // 8. Publish cross-instance event for horizontal scaling
      await this.redis.publishEvent({
        type: 'STATE_PATCH',
        roomId,
        payload: { patch, phase: newState.phase, round: newState.round },
        ts: Date.now(),
      });

      return { patch, newState };
    } finally {
      // Always release the lock — even on error
      await this.redis.releaseLock(roomId, lockToken);
    }
  }

  // ── Reconnect ────────────────────────────────────────────────────────────────

  async reconnect(
    roomId: string,
    playerId: string,
  ): Promise<{ state: MunchkinGameState; recentPatches: unknown[][] }> {
    const state = await this.redis.getRoomState(roomId);
    if (!state) throw new NotFoundException(`Room ${roomId} not found`);

    await this.redis.heartbeat(roomId, playerId);
    const recentPatches = await this.redis.getRecentPatches(roomId, 20);
    return { state, recentPatches };
  }

  // ── Read helpers ──────────────────────────────────────────────────────────────

  async getRoomInfo_public(roomId: string): Promise<RoomInfo> {
    return this.getRoomInfo(roomId);
  }

  async getAllActiveRooms(): Promise<RoomInfo[]> {
    const roomIds = await this.redis.getAllRoomIds();
    const results = await Promise.all(
      roomIds.map((id) => this.redis.getRoomInfo<RoomInfo>(id).catch(() => null)),
    );
    return results.filter((i): i is RoomInfo => i !== null);
  }

  async getOpenRooms(): Promise<RoomInfo[]> {
    return (await this.getAllActiveRooms()).filter((r) => r.startedAt === null);
  }

  async getRoomPresence(roomId: string): Promise<{ online: string[]; all: Record<string, number> }> {
    const [online, all] = await Promise.all([
      this.redis.getOnlinePlayers(roomId),
      this.redis.getPresenceMap(roomId),
    ]);
    return { online, all };
  }

  // ── Admin actions ──────────────────────────────────────────────────────────────

  async forceEndGame(roomId: string): Promise<void> {
    const state = await this.redis.getRoomState(roomId);
    if (!state) throw new NotFoundException(`Room ${roomId} not found`);
    await this.redis.setRoomState(roomId, {
      ...state,
      phase: 'GAME_OVER',
      finishedAt: Date.now(),
    });
  }

  async kickPlayer(roomId: string, targetPlayerId: string): Promise<RoomInfo> {
    const info = await this.getRoomInfo(roomId);
    const updated: RoomInfo = {
      ...info,
      playerIds: info.playerIds.filter((id) => id !== targetPlayerId),
    };
    await Promise.all([
      this.redis.setRoomInfo(roomId, updated),
      this.redis.clearPresence(roomId, targetPlayerId),
    ]);
    return updated;
  }

  async injectCard(roomId: string, playerId: string, cardId: string): Promise<MunchkinGameState> {
    const state = await this.redis.getRoomState(roomId);
    if (!state) throw new NotFoundException(`Room ${roomId} not found`);

    const { ALL_MUNCHKIN_CARDS } = await import('@homekit/engine');
    const card = ALL_MUNCHKIN_CARDS.find((c) => c.id === cardId);
    if (!card) throw new NotFoundException(`Card ${cardId} not found`);

    const player = state.players[playerId];
    if (!player) throw new NotFoundException(`Player ${playerId} not in room`);

    const newState: MunchkinGameState = {
      ...state,
      players: {
        ...state.players,
        [playerId]: { ...player, hand: [...player.hand, card] },
      },
    };
    await this.redis.setRoomState(roomId, newState);
    return newState;
  }

  async deleteRoom(roomId: string): Promise<void> {
    const info = await this.redis.getRoomInfo<RoomInfo>(roomId);
    if (info?.roomCode) await this.redis.deleteRoomCode(info.roomCode);
    await this.redis.deleteRoom(roomId);
  }
}
