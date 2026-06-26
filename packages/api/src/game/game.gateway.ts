import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { MunchkinAction } from '@homekit/engine';
import { RoomManagerService } from './room-manager.service';
import { RedisService } from './redis.service';

// ── Socket metadata ────────────────────────────────────────────────────────────

interface SocketMeta {
  playerId: string;
  roomId: string | null;
}

// ── Gateway ────────────────────────────────────────────────────────────────────

@WebSocketGateway({
  namespace: '/game',
  cors: { origin: '*', credentials: true },
  pingInterval: 10_000,
  pingTimeout: 30_000,
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  /** socket.id → { playerId, roomId } */
  private readonly socketMap = new Map<string, SocketMeta>();
  /** roomId → unsubscribe fn from Redis pub/sub */
  private readonly pubsubUnsubs = new Map<string, () => Promise<void>>();

  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly redis: RedisService,
  ) {}

  // ── Connection lifecycle ───────────────────────────────────────────────────

  handleConnection(client: Socket): void {
    this.socketMap.set(client.id, { playerId: client.id, roomId: null });
    this.logger.debug(`Connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const meta = this.socketMap.get(client.id);
    if (meta?.roomId) {
      await this.redis.clearPresence(meta.roomId, meta.playerId);
      this.server.to(meta.roomId).emit('PLAYER_DISCONNECTED', {
        playerId: meta.playerId,
        roomId: meta.roomId,
      });
    }
    this.socketMap.delete(client.id);
    this.logger.debug(`Disconnected: ${client.id}`);
    await this.broadcastRooms();
  }

  // ── Room management ────────────────────────────────────────────────────────

  @SubscribeMessage('CREATE_ROOM')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { playerId: string; playerName: string; pluginId?: string; settings?: Record<string, unknown> },
  ) {
    try {
      const info = await this.roomManager.createRoom(
        data.playerId,
        data.playerName,
        data.pluginId ?? 'munchkin',
        data.settings ?? {},
      );
      this.socketMap.set(client.id, { playerId: data.playerId, roomId: info.roomId });
      await client.join(info.roomId);
      await this.redis.heartbeat(info.roomId, data.playerId);
      this.subscribeRoomEvents(info.roomId);
      client.emit('ROOM_CREATED', { roomId: info.roomId, roomCode: info.roomCode, info });
      await this.broadcastRooms();
    } catch (err) {
      client.emit('ERROR', { code: 'CREATE_ROOM_FAILED', message: (err as Error).message });
    }
  }

  @SubscribeMessage('JOIN_ROOM')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; playerId: string; playerName: string },
  ) {
    try {
      const info = await this.roomManager.joinRoom(data.roomCode, data.playerId, data.playerName);
      this.socketMap.set(client.id, { playerId: data.playerId, roomId: info.roomId });
      await client.join(info.roomId);
      await this.redis.heartbeat(info.roomId, data.playerId);
      this.subscribeRoomEvents(info.roomId);

      client.emit('ROOM_JOINED', { roomId: info.roomId, info });
      this.server.to(info.roomId).emit('PLAYER_JOINED', {
        playerId: data.playerId,
        playerName: data.playerName,
        info,
      });
      await this.broadcastRooms();
    } catch (err) {
      client.emit('ERROR', { code: 'JOIN_FAILED', message: (err as Error).message });
    }
  }

  @SubscribeMessage('LEAVE_ROOM')
  async handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const meta = this.socketMap.get(client.id);
    if (meta?.roomId) {
      await client.leave(meta.roomId);
      await this.redis.clearPresence(meta.roomId, meta.playerId);
      this.socketMap.set(client.id, { ...meta, roomId: null });
      this.server.to(meta.roomId).emit('PLAYER_LEFT', { playerId: meta.playerId });
      await this.broadcastRooms();
    }
  }

  @SubscribeMessage('START_GAME')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    try {
      const state = await this.roomManager.startGame(data.roomId, data.playerId);
      this.server.to(data.roomId).emit('GAME_STARTED', { state });
      await this.broadcastRooms();
    } catch (err) {
      client.emit('ERROR', { code: 'START_FAILED', message: (err as Error).message });
    }
  }

  // ── Game actions ───────────────────────────────────────────────────────────

  @SubscribeMessage('GAME_ACTION')
  async handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string; action: MunchkinAction },
  ) {
    try {
      // Presence heartbeat on every action
      if (data.roomId) {
        await this.redis.heartbeat(data.roomId, data.playerId);
      }

      const { patch, newState } = await this.roomManager.applyAction(
        data.roomId,
        data.playerId,
        data.action,
      );

      this.server.to(data.roomId).emit('STATE_PATCH', {
        patch,
        round: newState.round,
        phase: newState.phase,
      });

      if (newState.phase === 'GAME_OVER') {
        this.server.to(data.roomId).emit('GAME_OVER', {
          winnerId: newState.winnerId,
          finalState: newState,
        });
      }

      const lastEvent = newState.eventLog[newState.eventLog.length - 1];
      if (lastEvent?.animationTrigger) {
        this.server.to(data.roomId).emit('ANIMATION_TRIGGER', lastEvent.animationTrigger);
      }
    } catch (err) {
      const msg = (err as Error).message;
      const code = msg.includes('Rate limit') ? 'RATE_LIMITED' : 'ACTION_FAILED';
      client.emit('ERROR', { code, message: msg });
    }
  }

  // ── Reconnect ──────────────────────────────────────────────────────────────

  @SubscribeMessage('RECONNECT')
  async handleReconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    try {
      const { state, recentPatches } = await this.roomManager.reconnect(data.roomId, data.playerId);
      this.socketMap.set(client.id, { playerId: data.playerId, roomId: data.roomId });
      await client.join(data.roomId);
      this.subscribeRoomEvents(data.roomId);
      client.emit('FULL_STATE', { state, recentPatches });

      // Broadcast updated presence to room
      const { online } = await this.roomManager.getRoomPresence(data.roomId);
      this.server.to(data.roomId).emit('PRESENCE_UPDATE', { online });
    } catch (err) {
      client.emit('ERROR', { code: 'RECONNECT_FAILED', message: (err as Error).message });
    }
  }

  // ── Heartbeat (clients should call every 15s) ─────────────────────────────

  @SubscribeMessage('HEARTBEAT')
  async handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string },
  ) {
    if (data.roomId && data.playerId) {
      await this.redis.heartbeat(data.roomId, data.playerId);
      const { online } = await this.roomManager.getRoomPresence(data.roomId);
      this.server.to(data.roomId).emit('PRESENCE_UPDATE', { online });
    }
  }

  // ── Chat ───────────────────────────────────────────────────────────────────

  @SubscribeMessage('CHAT_MESSAGE')
  async handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; playerId: string; playerName: string; text: string },
  ) {
    const message = { playerId: data.playerId, playerName: data.playerName, text: data.text, ts: Date.now() };
    await this.redis.pushChatMessage(data.roomId, message);
    this.server.to(data.roomId).emit('CHAT_MESSAGE', message);
    void client; // suppress unused warning
  }

  @SubscribeMessage('GET_CHAT_HISTORY')
  async handleGetChatHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const history = await this.redis.getChatHistory(data.roomId);
    client.emit('CHAT_HISTORY', { messages: history });
  }

  // ── Emotes ─────────────────────────────────────────────────────────────────

  @SubscribeMessage('EMOTE')
  handleEmote(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { roomId: string; playerId: string; emoteId: string },
  ) {
    this.server.to(data.roomId).emit('EMOTE', {
      playerId: data.playerId,
      emoteId: data.emoteId,
    });
  }

  // ── Room discovery ─────────────────────────────────────────────────────────

  @SubscribeMessage('LIST_ROOMS')
  async handleListRooms(@ConnectedSocket() client: Socket) {
    const rooms = await this.roomManager.getOpenRooms();
    client.emit('ROOMS_LIST', { rooms });
  }

  private async broadcastRooms(): Promise<void> {
    const rooms = await this.roomManager.getOpenRooms();
    this.server.emit('ROOMS_UPDATED', { rooms });
  }

  // ── Admin broadcast helpers ────────────────────────────────────────────────

  broadcastFullState(roomId: string, state: unknown): void {
    this.server.to(roomId).emit('FULL_STATE', { state });
  }

  broadcastSystemMessage(roomId: string, text: string): void {
    this.server.to(roomId).emit('SYSTEM_MESSAGE', { text });
  }

  // ── Redis Pub/Sub (cross-instance events) ─────────────────────────────────

  /**
   * Subscribe once per room.
   * When a second API instance applies an action and publishes to Redis,
   * this instance picks it up and forwards to its own connected sockets.
   */
  private subscribeRoomEvents(roomId: string): void {
    if (this.pubsubUnsubs.has(roomId)) return;

    this.redis
      .subscribeToRoom(roomId, (event) => {
        // Avoid re-broadcasting events we emitted ourselves (filter by ts proximity)
        if (event.type === 'STATE_PATCH') {
          const p = event.payload as { patch: unknown[]; phase: string; round: number };
          // Only forward if there are sockets for this room in our instance
          const roomSockets = this.server.sockets.adapter.rooms?.get(roomId);
          if (roomSockets && roomSockets.size > 0) {
            this.server.to(roomId).emit('STATE_PATCH_REMOTE', p);
          }
        }
      })
      .then((unsub) => {
        this.pubsubUnsubs.set(roomId, unsub);
      })
      .catch((err) => this.logger.warn(`Pub/sub subscribe failed for ${roomId}`, err));
  }
}
