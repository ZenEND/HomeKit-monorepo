import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MunchkinCard } from '@homekit/engine';
import { CardComponent } from './CardComponent';

interface CardHandProps {
  cards: MunchkinCard[];
  onPlayCard?: (card: MunchkinCard) => void;
  onEquipItem?: (card: MunchkinCard) => void;
  disabled?: boolean;
}

export function CardHand({ cards, onPlayCard, onEquipItem, disabled }: CardHandProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const count = cards.length;
  if (count === 0) return (
    <div className="flex h-20 items-center justify-center text-sm text-white/30">
      No cards in hand
    </div>
  );

  const spread = Math.min(120, count * 28);
  const step = count > 1 ? spread / (count - 1) : 0;
  const startX = -spread / 2;

  return (
    <div className="relative flex h-36 items-end justify-center">
      {cards.map((card, i) => {
        const x = startX + i * step;
        const rotate = ((i - (count - 1) / 2) / Math.max(count, 5)) * 18;
        const isHovered = hoveredIdx === i;
        const isSelected = selected === card.id;

        return (
          <motion.div
            key={card.id}
            style={{
              position: 'absolute',
              left: '50%',
              zIndex: isHovered || isSelected ? 20 : i,
            }}
            animate={{
              x,
              rotate: isHovered ? 0 : rotate,
              y: isHovered ? -20 : isSelected ? -30 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
          >
            <CardComponent
              card={card}
              selected={isSelected}
              onClick={() => {
                if (disabled) return;
                setSelected(isSelected ? null : card.id);
              }}
              className="-translate-x-1/2"
            />
          </motion.div>
        );
      })}

      {/* Action popover for selected card */}
      <AnimatePresence>
        {selected && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-40 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-xl bg-gray-900/95 p-2 shadow-xl border border-white/10"
          >
            {(() => {
              const card = cards.find((c) => c.id === selected);
              if (!card) return null;
              return (
                <>
                  <button
                    onClick={() => { onPlayCard?.(card); setSelected(null); }}
                    className="rounded-lg bg-brand-primary/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary"
                  >
                    Play
                  </button>
                  {card.itemSlot && (
                    <button
                      onClick={() => { onEquipItem?.(card); setSelected(null); }}
                      className="rounded-lg bg-green-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
                    >
                      Equip
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Cancel
                  </button>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
