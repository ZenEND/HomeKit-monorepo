import { motion } from 'motion/react';
import type { PlayerState } from '@homekit/engine';
import { cx } from '@/utils/cx';

const RACE_EMOJI: Record<string, string> = {
  human: '🧑',
  elf: '🧝',
  dwarf: '🪨',
  halfling: '🌿',
  orc: '👹',
};

const CLASS_EMOJI: Record<string, string> = {
  warrior: '⚔',
  wizard: '🧙',
  thief: '🗡',
  cleric: '✝',
  ranger: '🏹',
};

interface LevelRingProps {
  level: number;
  maxLevel?: number;
  size?: number;
}

function LevelRing({ level, maxLevel = 10, size = 56 }: LevelRingProps) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(level / maxLevel, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={3}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </svg>
  );
}

interface PlayerSeatProps {
  player: PlayerState;
  isActive: boolean;
  isMe: boolean;
}

export function PlayerSeat({ player, isActive, isMe }: PlayerSeatProps) {
  const seatSize = 56;

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.08 : 1,
        filter: isActive ? 'drop-shadow(0 0 12px rgba(245,158,11,0.6))' : 'none',
      }}
      className={cx(
        'relative flex flex-col items-center gap-1',
        player.status === 'dead' && 'opacity-40',
      )}
    >
      {/* Avatar circle with level ring */}
      <div className="relative" style={{ width: seatSize, height: seatSize }}>
        <LevelRing level={player.level} size={seatSize} />
        <div
          className={cx(
            'absolute inset-1 flex items-center justify-center rounded-full text-xl',
            isMe ? 'bg-brand-primary/30 ring-2 ring-brand-primary' : 'bg-white/10',
          )}
        >
          {RACE_EMOJI[player.race] ?? '🧑'}
        </div>
        {isActive && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -inset-1 rounded-full ring-2 ring-amber-400"
          />
        )}
      </div>

      {/* Name */}
      <span className={cx('text-xs font-semibold', isMe ? 'text-brand-secondary' : 'text-white/80')}>
        {player.name}
      </span>

      {/* Stats badges */}
      <div className="flex items-center gap-1">
        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
          Lv.{player.level}
        </span>
        <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
          💪{player.power}
        </span>
      </div>

      {/* Race/Class icons */}
      <div className="flex gap-1 text-[10px] text-white/40">
        <span title={player.race}>{RACE_EMOJI[player.race] ?? '?'}</span>
        <span title={player.class}>{CLASS_EMOJI[player.class] ?? '?'}</span>
        {player.gold > 0 && (
          <span className="text-yellow-400">💰{player.gold}</span>
        )}
      </div>

      {/* Ally indicator */}
      {player.allyId && (
        <span className="text-[10px] text-green-400">🤝 Allied</span>
      )}

      {/* Status overlay */}
      {player.status === 'fleeing' && (
        <span className="text-[10px] text-yellow-400 animate-pulse">🏃 Fleeing</span>
      )}
    </motion.div>
  );
}
