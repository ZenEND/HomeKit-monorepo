import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import * as jsonpatch from 'fast-json-patch';
import type { MunchkinGameState, AnimationTrigger, PlayerState } from '@homekit/engine';
import { EventLog } from '@/features/munchkin/components/EventLog';
import { LevelUpCelebration } from '@/features/munchkin/components/LevelUpCelebration';
import { EffectOverlay } from '@/features/munchkin/components/EffectOverlay';
import { PlayerSeat } from '@/features/munchkin/components/PlayerSeat';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Spectator() {
  const { code } = useParams<{ code: string }>();
  const [state, setState] = useState<MunchkinGameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [levelUpPlayer, setLevelUpPlayer] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<AnimationTrigger | null>(null);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/game`, {
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnected(true);
      if (code) {
        socket.emit('JOIN_ROOM', {
          roomCode: code,
          playerId: `spectator_${Date.now()}`,
          playerName: 'Spectator',
        });
      }
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('ROOM_JOINED', ({ roomId }: { roomId: string }) => {
      socket.emit('RECONNECT', { roomId, playerId: `spectator_${Date.now()}` });
    });

    socket.on('FULL_STATE', ({ state: s }: { state: MunchkinGameState }) => {
      setState(s);
    });

    socket.on('STATE_PATCH', ({ patch }: { patch: jsonpatch.Operation[] }) => {
      setState((current) => {
        if (!current) return current;
        try {
          return jsonpatch.applyPatch(
            JSON.parse(JSON.stringify(current)),
            patch,
            true,
            false,
          ).newDocument as MunchkinGameState;
        } catch {
          return current;
        }
      });
    });

    socket.on('ANIMATION_TRIGGER', (trigger: AnimationTrigger) => {
      setActiveEffect(trigger);
      if (trigger.type === 'level_up') {
        setLevelUpPlayer(trigger.targetPlayerId ?? null);
        setTimeout(() => setLevelUpPlayer(null), 2500);
      }
      setTimeout(() => setActiveEffect(null), 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  const players: PlayerState[] = state
    ? state.turnOrder.map((id) => state.players[id]).filter(Boolean) as PlayerState[]
    : [];

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#060810] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0d1a2a_0%,_#060810_70%)]" />

      {/* Effect overlay */}
      <AnimatePresence>
        {activeEffect && <EffectOverlay trigger={activeEffect} />}
      </AnimatePresence>

      {/* Level up celebration */}
      <AnimatePresence>
        {levelUpPlayer && state && (
          <LevelUpCelebration
            playerName={state.players[levelUpPlayer]?.name ?? 'Player'}
            newLevel={state.players[levelUpPlayer]?.level ?? 1}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <span className="font-mono text-lg font-bold tracking-widest text-white/80">
            ROOM: {code}
          </span>
        </div>
        {state && (
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>Round {state.round}</span>
            <span className="rounded bg-white/10 px-3 py-1 font-semibold text-white">
              {state.phase.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        <div className="text-xs font-semibold uppercase tracking-widest text-red-400">
          🔴 LIVE
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {!state ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent mx-auto" />
              <p className="mt-3 text-sm text-white/40">
                {connected ? 'Loading game state...' : 'Connecting...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 gap-4 p-4">
            {/* Game table area (left) */}
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              {/* Player seats */}
              <div className="flex flex-wrap justify-center gap-6">
                {players.map((player) => (
                  <PlayerSeat
                    key={player.id}
                    player={player}
                    isActive={player.id === state.activePlayerId}
                    isMe={false}
                  />
                ))}
              </div>

              {/* Active combat display */}
              {state.combatStack && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl border border-red-500/30 bg-red-950/40 px-8 py-4 text-center"
                >
                  <p className="text-xs uppercase tracking-widest text-red-400 mb-1">⚔ Combat</p>
                  <p className="text-xl font-bold text-white">{state.combatStack.monster.name}</p>
                  <p className="text-sm text-red-300">Monster Level: {state.combatStack.monsterPower}</p>
                </motion.div>
              )}

              {/* Table cards */}
              {state.tableCards.length > 0 && (
                <div className="flex gap-2">
                  {state.tableCards.slice(-5).map((card) => (
                    <div
                      key={card.id}
                      className="flex h-16 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-center text-[10px] text-white/50"
                    >
                      {card.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="w-64 flex flex-col gap-3">
              {/* Active player */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Active Player</p>
                {state.players[state.activePlayerId] && (
                  <p className="font-bold text-white">{state.players[state.activePlayerId].name}</p>
                )}
                <p className="text-sm text-brand-secondary capitalize">{state.phase.replace(/_/g, ' ')}</p>
              </div>

              {/* Player list */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Players</p>
                <div className="flex flex-col gap-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-sm text-white/80">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-amber-300">Lv.{p.level}</span>
                        <span className="text-xs text-blue-300">💪{p.power}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event log */}
      {state && <EventLog events={state.eventLog} />}
    </div>
  );
}
