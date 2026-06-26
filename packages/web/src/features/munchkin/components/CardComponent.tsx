import { useState } from 'react';
import { motion } from 'motion/react';
import type { MunchkinCard } from '@homekit/engine';
import { cx } from '@/utils/cx';

const TYPE_COLORS: Record<string, string> = {
  DOOR: 'from-amber-900/60 to-amber-800/40 border-amber-700/30',
  TREASURE: 'from-yellow-900/60 to-yellow-800/40 border-yellow-700/30',
  PARTY_VOTE: 'from-purple-900/60 to-purple-800/40 border-purple-700/30',
  CURSE: 'from-red-900/60 to-red-800/40 border-red-700/30',
  MINIGAME: 'from-cyan-900/60 to-cyan-800/40 border-cyan-700/30',
};

const SUBTYPE_ICONS: Record<string, string> = {
  monster: '👾',
  item: '⚔',
  race: '🧝',
  class: '🗡',
  curse: '💀',
  situation: '🎭',
  boss: '🐉',
  party_vote: '🗳',
  minigame: '🎮',
  ally: '🤝',
  gold: '💰',
  level_up: '⬆',
};

interface CardComponentProps {
  card: MunchkinCard;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  layoutId?: string;
}

export function CardComponent({
  card,
  faceDown = false,
  selected = false,
  onClick,
  className,
  layoutId,
}: CardComponentProps) {
  const [revealed, setRevealed] = useState(!faceDown);
  const gradient = TYPE_COLORS[card.type] ?? TYPE_COLORS.DOOR;

  const handleClick = () => {
    if (faceDown && !revealed) {
      setRevealed(true);
    }
    onClick?.();
  };

  return (
    <motion.div
      layoutId={layoutId}
      onClick={handleClick}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cx(
        'group relative h-40 w-28 cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-b shadow-lg transition-shadow hover:ring-1 hover:ring-brand-primary/40',
        gradient,
        selected && 'ring-2 ring-brand-primary ring-offset-2 ring-offset-transparent',
        className,
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        animate={{ rotateY: revealed ? 0 : 180 }}
        transition={{ duration: 0.4 }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-2xl p-2"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Shimmer streak on hover */}
          <div className="card-shimmer-streak pointer-events-none absolute inset-0 z-10 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="flex h-full flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                {card.type}
              </span>
              <span className="text-base">{SUBTYPE_ICONS[card.subtype] ?? '🃏'}</span>
            </div>

            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="h-16 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 items-center justify-center rounded-lg bg-black/20 text-3xl">
                {SUBTYPE_ICONS[card.subtype] ?? '🃏'}
              </div>
            )}

            <p className="text-center text-xs font-bold text-white leading-tight">{card.name}</p>

            {(card.level || card.itemBonus) && (
              <div className="flex justify-center gap-2">
                {card.level && (
                  <span className="rounded bg-red-500/30 px-1.5 py-0.5 text-xs font-semibold text-red-300">
                    Lv.{card.level}
                  </span>
                )}
                {card.itemBonus && card.itemBonus > 0 && (
                  <span className="rounded bg-green-500/30 px-1.5 py-0.5 text-xs font-semibold text-green-300">
                    +{card.itemBonus}
                  </span>
                )}
              </div>
            )}

            {card.flavorText && (
              <p className="mt-auto text-center text-[9px] italic text-white/40 line-clamp-2">
                "{card.flavorText}"
              </p>
            )}
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl opacity-30">🃏</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
