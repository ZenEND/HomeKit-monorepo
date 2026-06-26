import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from '@/store/useUserStore';
import { useGameSocket } from '@/features/munchkin/hooks/useGameSocket';
import { cx } from '@/utils/cx';

interface RoomInfo {
  roomId: string;
  roomCode: string;
  playerIds: string[];
  playerNames: Record<string, string>;
  hostId: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const playerId = user?.id ?? 'guest';
  const playerName = user?.email?.split('@')[0] ?? 'Player';

  const [mode, setMode] = useState<'idle' | 'create' | 'join' | 'waiting'>('idle');
  const [roomCode, setRoomCode] = useState('');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { createRoom, joinRoom, startGame, on } = useGameSocket({
    playerId,
    playerName,
    onError: (_, message) => setError(message),
  });

  useEffect(() => {
    const off1 = on<{ roomId: string; roomCode: string; info: RoomInfo }>('ROOM_CREATED', ({ info }) => {
      setRoomInfo(info);
      setMode('waiting');
    });
    const off2 = on<{ roomId: string; info: RoomInfo }>('ROOM_JOINED', ({ info }) => {
      setRoomInfo(info);
      setMode('waiting');
    });
    const off3 = on<{ playerId: string; playerName: string; info: RoomInfo }>('PLAYER_JOINED', ({ info }) => {
      setRoomInfo(info);
    });
    const off4 = on<{ state: unknown }>('GAME_STARTED', ({ state: _ }) => {
      if (roomInfo) navigate(`/munchkin/game/${roomInfo.roomId}`);
    });
    return () => { off1(); off2(); off3(); off4(); };
  }, [on, navigate, roomInfo]);

  const handleCreate = useCallback(() => {
    setError(null);
    createRoom();
  }, [createRoom]);

  const handleJoin = useCallback(() => {
    if (!roomCode.trim()) { setError('Enter a room code'); return; }
    setError(null);
    joinRoom(roomCode.trim().toUpperCase());
  }, [joinRoom, roomCode]);

  const handleStart = useCallback(() => {
    if (roomInfo) startGame(roomInfo.roomId);
  }, [startGame, roomInfo]);

  const isHost = roomInfo?.hostId === playerId;
  const players = roomInfo
    ? roomInfo.playerIds.map((id) => ({ id, name: roomInfo.playerNames[id] ?? id }))
    : [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">🃏 Munchkin Party</h1>
          <p className="mt-2 text-sm text-tertiary">Multiplayer card game. Reach level 10 to win.</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => setMode('create')}
                className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-brand-secondary transition hover:opacity-90"
              >
                Create New Room
              </button>
              <button
                onClick={() => setMode('join')}
                className="rounded-xl border border-secondary/40 bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-secondary/80"
              >
                Join Room
              </button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <p className="text-sm text-tertiary">You will be the host. Share the code with friends after creation.</p>
              <button
                onClick={handleCreate}
                className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-brand-secondary"
              >
                Create Room
              </button>
              <button onClick={() => setMode('idle')} className="text-sm text-tertiary hover:text-secondary">← Back</button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="Enter 6-character room code"
                className="rounded-xl border border-secondary/40 bg-secondary px-4 py-3 text-center text-lg font-bold tracking-widest text-primary uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                onClick={handleJoin}
                className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-brand-secondary"
              >
                Join
              </button>
              <button onClick={() => setMode('idle')} className="text-sm text-tertiary hover:text-secondary">← Back</button>
            </motion.div>
          )}

          {mode === 'waiting' && roomInfo && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              <div className="rounded-2xl border border-secondary/40 bg-secondary/50 p-4 text-center">
                <p className="text-xs text-tertiary">Room Code</p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-brand-secondary">{roomInfo.roomCode}</p>
                <p className="mt-1 text-xs text-tertiary">Share this with your friends</p>
              </div>

              <div className="rounded-2xl border border-secondary/40 bg-secondary/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-tertiary">Players ({players.length}/6)</p>
                <div className="flex flex-col gap-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-brand-secondary">
                        {p.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-primary">{p.name}</span>
                      {p.id === roomInfo.hostId && (
                        <span className="rounded bg-brand-primary/10 px-1.5 py-0.5 text-xs text-brand-secondary">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isHost && (
                <button
                  onClick={handleStart}
                  disabled={players.length < 2}
                  className={cx(
                    'rounded-xl px-4 py-3 text-sm font-semibold transition',
                    players.length >= 2
                      ? 'bg-brand-primary text-brand-secondary hover:opacity-90'
                      : 'cursor-not-allowed bg-secondary/50 text-tertiary',
                  )}
                >
                  {players.length < 2 ? 'Waiting for more players...' : 'Start Game'}
                </button>
              )}

              {!isHost && (
                <p className="text-center text-sm text-tertiary">Waiting for host to start the game...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
