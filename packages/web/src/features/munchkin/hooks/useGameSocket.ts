import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as jsonpatch from 'fast-json-patch';
import type { MunchkinGameState, MunchkinAction, AnimationTrigger } from '@homekit/engine';
import { useGameStore } from './useGameState';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface UseGameSocketOptions {
  roomId?: string;
  playerId: string;
  playerName: string;
  onAnimationTrigger?: (trigger: AnimationTrigger) => void;
  onError?: (code: string, message: string) => void;
}

export function useGameSocket(opts: UseGameSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const { setState, applyPatch } = useGameStore();

  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${SOCKET_URL}/game`, {
        autoConnect: false,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on('GAME_STARTED', ({ state }: { state: MunchkinGameState }) => {
      setState(state);
    });

    socket.on('STATE_PATCH', ({ patch }: { patch: jsonpatch.Operation[] }) => {
      applyPatch(patch);
    });

    socket.on('FULL_STATE', ({ state }: { state: MunchkinGameState }) => {
      setState(state);
    });

    socket.on('ANIMATION_TRIGGER', (trigger: AnimationTrigger) => {
      opts.onAnimationTrigger?.(trigger);
    });

    socket.on('ERROR', ({ code, message }: { code: string; message: string }) => {
      opts.onError?.(code, message);
    });

    socket.connect();

    return () => {
      socket.off('GAME_STARTED');
      socket.off('STATE_PATCH');
      socket.off('FULL_STATE');
      socket.off('ANIMATION_TRIGGER');
      socket.off('ERROR');
    };
  }, [getSocket, setState, applyPatch, opts.onAnimationTrigger, opts.onError]);

  const createRoom = useCallback((settings?: Record<string, unknown>) => {
    const socket = getSocket();
    socket.emit('CREATE_ROOM', {
      playerId: opts.playerId,
      playerName: opts.playerName,
      pluginId: 'munchkin',
      settings,
    });
  }, [getSocket, opts.playerId, opts.playerName]);

  const joinRoom = useCallback((roomCode: string) => {
    const socket = getSocket();
    socket.emit('JOIN_ROOM', {
      roomCode,
      playerId: opts.playerId,
      playerName: opts.playerName,
    });
  }, [getSocket, opts.playerId, opts.playerName]);

  const startGame = useCallback((roomId: string) => {
    const socket = getSocket();
    socket.emit('START_GAME', { roomId, playerId: opts.playerId });
  }, [getSocket, opts.playerId]);

  const sendAction = useCallback((roomId: string, action: MunchkinAction) => {
    const socket = getSocket();
    socket.emit('GAME_ACTION', { roomId, playerId: opts.playerId, action });
  }, [getSocket, opts.playerId]);

  const reconnect = useCallback((roomId: string) => {
    const socket = getSocket();
    socket.emit('RECONNECT', { roomId, playerId: opts.playerId });
  }, [getSocket, opts.playerId]);

  const on = useCallback(<T = unknown>(event: string, handler: (data: T) => void) => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [getSocket]);

  return { createRoom, joinRoom, startGame, sendAction, reconnect, on };
}
