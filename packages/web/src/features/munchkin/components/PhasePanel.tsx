import { motion } from 'motion/react';
import type { MunchkinAction, Phase } from '@homekit/engine';

interface PhasePanelProps {
  phase: Phase;
  isActivePlayer: boolean;
  onAction: (action: MunchkinAction) => void;
}

export function PhasePanel({ phase, isActivePlayer, onAction }: PhasePanelProps) {
  if (!isActivePlayer) return (
    <div className="text-xs text-white/30">Waiting for active player...</div>
  );

  switch (phase) {
    case 'DOOR_DRAW':
      return (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction({ type: 'KICK_DOOR' })}
          className="rounded-2xl bg-amber-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-amber-900/50 hover:bg-amber-500 transition"
        >
          🚪 Kick Down the Door!
        </motion.button>
      );

    case 'LOOT':
      return (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction({ type: 'LOOT_ROOM' })}
          className="rounded-2xl bg-yellow-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-yellow-900/50 hover:bg-yellow-500"
        >
          📦 Loot the Room!
        </motion.button>
      );

    case 'CHARITY':
      return (
        <div className="text-center">
          <p className="mb-2 text-sm text-yellow-300">You have too many cards! Give some away.</p>
          <button
            onClick={() => onAction({ type: 'CHARITY_DONE' })}
            className="rounded-xl bg-gray-700 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Done giving
          </button>
        </div>
      );

    case 'TURN_END':
      return (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction({ type: 'END_TURN' })}
          className="rounded-2xl bg-gray-600 px-8 py-3 text-sm font-bold text-white hover:bg-gray-500"
        >
          End Turn →
        </motion.button>
      );

    case 'BOSS_RAID':
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onAction({ type: 'BOSS_RAID_FIGHT' })}
            className="rounded-xl bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            🐉 Fight the Boss!
          </button>
          <button
            onClick={() => onAction({ type: 'BOSS_RAID_FLEE' })}
            className="rounded-xl bg-gray-700 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Run!
          </button>
        </div>
      );

    case 'DOOR_EVENT':
      return (
        <div className="text-center">
          <p className="text-sm text-amber-300 animate-pulse">🚪 Door Event in progress...</p>
        </div>
      );

    case 'GAME_OVER':
      return (
        <div className="text-center">
          <p className="text-xl font-bold text-yellow-400">🏆 Game Over!</p>
        </div>
      );

    default:
      return null;
  }
}
