import { motion } from 'motion/react';

interface LevelUpCelebrationProps {
  playerName: string;
  newLevel: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LevelUpCelebration({ playerName, newLevel }: LevelUpCelebrationProps) {
  const reduced = prefersReducedMotion();

  if (reduced) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60">
        <p className="text-5xl font-black text-amber-400">LEVEL UP!</p>
        <p className="mt-2 text-xl font-bold text-white">{playerName}</p>
        <p className="mt-1 text-4xl font-black text-amber-300">Level {newLevel}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Shake container */}
      <motion.div
        animate={{ x: [0, -8, 8, -8, 8, -4, 4, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        {/* Level ring burst */}
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 2.5], opacity: [1, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-400"
        />

        {/* Star burst */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-1/2 text-2xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos((i * Math.PI * 2) / 8) * 120,
              y: Math.sin((i * Math.PI * 2) / 8) * 120,
              opacity: 0,
              scale: 1.5,
            }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            ⭐
          </motion.div>
        ))}

        <motion.p
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          className="text-6xl font-black text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]"
        >
          LEVEL UP!
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-2xl font-bold text-white"
        >
          {playerName}
        </motion.p>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-1 text-5xl font-black text-amber-300"
        >
          Level {newLevel}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
