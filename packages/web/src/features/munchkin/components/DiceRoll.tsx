import { motion } from 'motion/react';

const DICE_FACES: Record<number, string> = {
  1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅',
};

interface DiceRollProps {
  result: number | null;
}

export function DiceRoll({ result }: DiceRollProps) {
  return (
    <motion.div
      animate={{
        rotateX: result ? [0, 360, 720] : 0,
        rotateY: result ? [0, 180, 360] : 0,
        scale: result ? [1, 1.3, 1] : 1,
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 text-4xl shadow-lg"
    >
      {result ? DICE_FACES[result] ?? '🎲' : '🎲'}
    </motion.div>
  );
}
