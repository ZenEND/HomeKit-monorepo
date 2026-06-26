import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { io, type Socket } from 'socket.io-client';
import { PuzzlePiece01, Plus, Users01 } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useUserStore } from '@/store/useUserStore';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface RoomInfo {
  roomId: string;
  roomCode: string;
  pluginId: string;
  hostId: string;
  playerIds: string[];
  playerNames: Record<string, string>;
  phase: string;
  startedAt: number | null;
}

const GAME_CATALOG = [
  {
    id: 'munchkin',
    name: 'Munchkin Party',
    description: 'Kick down the door, kill the monster, grab the treasure. Reach level 10 to win.',
    pluginId: 'munchkin',
  },
];

export function Games() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const playerId = user?.id ?? `guest_${Date.now()}`;
  const playerName = user?.email?.split('@')[0] ?? 'Player';

  const socketRef = useRef<Socket | null>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [pendingRoom, setPendingRoom] = useState<RoomInfo | null>(null);
  const [joiningRoomCode, setJoiningRoomCode] = useState<string | null>(null);

  // Socket setup
  useEffect(() => {
    const socket = io(`${SOCKET_URL}/game`, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('LIST_ROOMS');
    });

    socket.on('ROOMS_LIST', ({ rooms: r }: { rooms: RoomInfo[] }) => {
      setRooms(r);
      setLoadingRooms(false);
    });

    socket.on('ROOMS_UPDATED', ({ rooms: r }: { rooms: RoomInfo[] }) => {
      setRooms(r);
      setLoadingRooms(false);
    });

    socket.on('ROOM_CREATED', ({ info }: { info: RoomInfo }) => {
      setPendingRoom(info);
    });

    socket.on('ROOM_JOINED', ({ info }: { info: RoomInfo }) => {
      setPendingRoom(info);
      setJoiningRoomCode(null);
    });

    socket.on('PLAYER_JOINED', ({ info }: { info: RoomInfo }) => {
      setPendingRoom((prev) => (prev?.roomId === info.roomId ? info : prev));
    });

    socket.on('GAME_STARTED', () => {
      if (pendingRoomRef.current) {
        navigate(`/munchkin/game/${pendingRoomRef.current.roomId}`);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [navigate]);

  // Keep a ref to pendingRoom for the GAME_STARTED closure
  const pendingRoomRef = useRef<RoomInfo | null>(null);
  useEffect(() => {
    pendingRoomRef.current = pendingRoom;
  }, [pendingRoom]);

  const handleCreateRoom = (pluginId: string) => {
    socketRef.current?.emit('CREATE_ROOM', { playerId, playerName, pluginId });
  };

  const handleJoin = (roomCode: string) => {
    setJoiningRoomCode(roomCode);
    socketRef.current?.emit('JOIN_ROOM', { roomCode, playerId, playerName });
  };

  const handleStartGame = () => {
    if (pendingRoom) {
      socketRef.current?.emit('START_GAME', { roomId: pendingRoom.roomId, playerId });
    }
  };

  const handleLeaveWaiting = () => {
    if (pendingRoom) {
      socketRef.current?.emit('LEAVE_ROOM');
    }
    setPendingRoom(null);
  };

  const isHost = pendingRoom?.hostId === playerId;
  const players = pendingRoom
    ? pendingRoom.playerIds.map((id) => ({ id, name: pendingRoom.playerNames[id] ?? id }))
    : [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <AnimatePresence mode="wait">
        {/* Waiting room overlay */}
        {pendingRoom && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="glass-card w-full max-w-md p-6"
            >
              <div className="mb-5 text-center">
                <p className="text-xs text-quaternary">Room Code</p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-brand-secondary">
                  {pendingRoom.roomCode}
                </p>
                <p className="mt-1 text-xs text-tertiary">Share with friends</p>
              </div>

              <div className="mb-4 rounded-xl border border-secondary/60 bg-primary/40 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-quaternary">
                  Players ({players.length}/6)
                </p>
                <div className="flex flex-col gap-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-brand-secondary">
                        {p.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-primary">{p.name}</span>
                      {p.id === pendingRoom.hostId && (
                        <Badge color="brand" size="sm">Host</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isHost ? (
                  <Button
                    color="primary"
                    size="md"
                    onClick={handleStartGame}
                    isLoading={false}
                  >
                    {players.length < 2 ? 'Waiting for players…' : 'Start Game'}
                  </Button>
                ) : (
                  <p className="text-center text-sm text-tertiary">
                    Waiting for host to start…
                  </p>
                )}
                <Button color="secondary" size="sm" onClick={handleLeaveWaiting}>
                  Leave room
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex flex-col gap-6">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <FeaturedIcon icon={PuzzlePiece01} color="brand" theme="gradient" size="lg" />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Game Hub</h1>
            <p className="mt-1 text-sm text-tertiary">
              Create a room or join one to start playing instantly.
            </p>
          </div>
        </motion.header>

        {/* Section 1: Available games */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="mb-3 text-sm font-semibold text-primary">Available games</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {GAME_CATALOG.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass-card p-5"
              >
                <p className="text-sm font-semibold text-primary">{game.name}</p>
                <p className="mt-1 text-xs text-tertiary">{game.description}</p>
                <div className="mt-4">
                  <Button
                    color="primary"
                    size="sm"
                    iconLeading={Plus}
                    onClick={() => handleCreateRoom(game.pluginId)}
                  >
                    Create room
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section 2: Open rooms */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-3 text-sm font-semibold text-primary">Open rooms</h2>

          {loadingRooms ? (
            <div className="flex items-center gap-2 py-4 text-sm text-quaternary">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⟳
              </motion.span>
              Loading rooms…
            </div>
          ) : rooms.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-tertiary">
              No open rooms yet — create one above.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {rooms.map((room) => {
                  const gameName =
                    GAME_CATALOG.find((g) => g.pluginId === room.pluginId)?.name ?? room.pluginId;
                  const hostName = room.playerNames[room.hostId] ?? room.hostId;
                  const isJoining = joiningRoomCode === room.roomCode;
                  return (
                    <motion.div
                      key={room.roomId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-secondary/60 bg-primary/40 px-3 py-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-primary">
                          {gameName}{' '}
                          <span className="text-xs text-quaternary font-mono">{room.roomCode}</span>
                        </span>
                        <span className="text-xs text-tertiary">Host: {hostName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color="gray" size="sm">
                          {room.playerIds.length}/6
                        </Badge>
                        <Button
                          color="secondary"
                          size="sm"
                          iconLeading={Users01}
                          isLoading={isJoining}
                          onClick={() => handleJoin(room.roomCode)}
                        >
                          Join
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
