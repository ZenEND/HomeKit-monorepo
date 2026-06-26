import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GameEvent } from '@homekit/engine';

const EVENT_ICONS: Record<string, string> = {
  DOOR_DRAW: '🚪',
  COMBAT_WIN: '🏆',
  COMBAT_LOSE: '💀',
  FLEE_SUCCESS: '🏃',
  FLEE_FAIL: '😱',
  LEVEL_UP: '⬆',
  SELL_ITEM: '💰',
  LOOT_ROOM: '📦',
  MINIGAME_WIN: '🎮',
  MINIGAME_FAIL: '❌',
  BOSS_WIN: '🐉',
  BOSS_LOSE: '😵',
  ALLY_REQUEST: '🤝',
  ELF_FLEE_BONUS: '🧝',
};

interface EventLogProps {
  events: GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events]);

  const recent = events.slice(-10);

  return (
    <div
      ref={scrollRef}
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-3 overflow-x-auto bg-black/70 px-4 py-2 backdrop-blur-sm"
      style={{ scrollbarWidth: 'none' }}
    >
      <AnimatePresence initial={false}>
        {recent.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1"
          >
            <span className="text-sm">{EVENT_ICONS[event.type] ?? '📋'}</span>
            <span className="text-xs text-white/70 whitespace-nowrap">{event.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
