import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import type { MunchkinGameState } from '@homekit/engine';

interface RoomInfo {
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

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000' });

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function GameMonitor() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<MunchkinGameState | null>(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await api.get<RoomInfo[]>('/admin/monitor/rooms');
      setRooms(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const loadRoomState = useCallback(async (roomId: string) => {
    setStateLoading(true);
    try {
      const { data } = await api.get<{ state: MunchkinGameState }>(`/admin/monitor/rooms/${roomId}`);
      setRoomState(data.state);
    } finally {
      setStateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) { setRoomState(null); return; }
    loadRoomState(selected);
    const interval = setInterval(() => loadRoomState(selected), 2000);
    return () => clearInterval(interval);
  }, [selected, loadRoomState]);

  const handleForceEnd = async (roomId: string) => {
    if (!confirm('Force end this game?')) return;
    await api.post(`/admin/monitor/rooms/${roomId}/force-end`);
    await fetchRooms();
  };

  const handleKick = async (roomId: string, playerId: string) => {
    await api.post(`/admin/monitor/rooms/${roomId}/kick`, { targetPlayerId: playerId });
    await fetchRooms();
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Rooms table */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">Game Monitor</h1>
          <button
            onClick={fetchRooms}
            className="rounded-lg border border-secondary/40 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-primary_hover"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-tertiary">
            No active game rooms.
          </div>
        ) : (
          <div className="overflow-auto rounded-xl border border-secondary/40">
            <table className="w-full text-sm">
              <thead className="border-b border-secondary/40 bg-secondary/30">
                <tr>
                  {['Code', 'Plugin', 'Players', 'Phase', 'Round', 'Duration', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-tertiary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/20">
                {rooms.map((room) => (
                  <tr
                    key={room.roomId}
                    onClick={() => setSelected(selected === room.roomId ? null : room.roomId)}
                    className={`cursor-pointer transition hover:bg-secondary/20 ${selected === room.roomId ? 'bg-brand-primary/10' : ''}`}
                  >
                    <td className="px-3 py-2 font-mono font-bold text-primary">{room.roomCode}</td>
                    <td className="px-3 py-2 text-tertiary capitalize">{room.pluginId}</td>
                    <td className="px-3 py-2 text-secondary">{room.playerIds.length}</td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-secondary">
                        {room.phase}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-tertiary">{room.round}</td>
                    <td className="px-3 py-2 text-tertiary">
                      {room.startedAt ? formatDuration(Date.now() - room.startedAt) : 'Not started'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleForceEnd(room.roomId); }}
                        className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400 hover:bg-red-500/30"
                      >
                        Force End
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* State drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-96 flex flex-col rounded-xl border border-secondary/40 bg-secondary/20 backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-secondary/40 p-3">
              <h2 className="text-sm font-semibold text-primary">
                Room: {rooms.find((r) => r.roomId === selected)?.roomCode}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-tertiary hover:text-secondary"
              >
                ✕
              </button>
            </div>

            {/* Player list with kick */}
            {rooms.find((r) => r.roomId === selected) && (
              <div className="border-b border-secondary/40 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-tertiary">Players</p>
                <div className="flex flex-col gap-1.5">
                  {rooms.find((r) => r.roomId === selected)!.playerIds.map((pid) => {
                    const room = rooms.find((r) => r.roomId === selected)!;
                    return (
                      <div key={pid} className="flex items-center justify-between">
                        <span className="text-xs text-secondary">
                          {room.playerNames[pid] ?? pid}
                          {pid === room.hostId && (
                            <span className="ml-1 text-brand-secondary">(host)</span>
                          )}
                        </span>
                        <button
                          onClick={() => handleKick(selected, pid)}
                          className="text-[10px] text-red-400 hover:text-red-300"
                        >
                          Kick
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* State JSON tree */}
            <div className="flex-1 overflow-auto p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">Live State</p>
                {stateLoading && (
                  <div className="h-3 w-3 animate-spin rounded-full border border-brand-primary border-t-transparent" />
                )}
              </div>
              {roomState ? (
                <pre className="whitespace-pre-wrap break-all rounded-lg bg-black/30 p-2 text-[10px] text-green-300/80 font-mono overflow-auto max-h-96">
                  {JSON.stringify(
                    {
                      phase: roomState.phase,
                      round: roomState.round,
                      activePlayerId: roomState.activePlayerId,
                      bossRaidActive: roomState.bossRaidActive,
                      players: Object.fromEntries(
                        Object.entries(roomState.players).map(([id, p]) => [
                          id,
                          { name: p.name, level: p.level, power: p.power, gold: p.gold, handCount: p.hand.length },
                        ]),
                      ),
                      combatStack: roomState.combatStack
                        ? {
                            monster: roomState.combatStack.monster.name,
                            monsterPower: roomState.combatStack.monsterPower,
                            outcome: roomState.combatStack.outcome,
                          }
                        : null,
                    },
                    null,
                    2,
                  )}
                </pre>
              ) : (
                <p className="text-xs text-tertiary">Loading state...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
