import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

// ── Dice face dots layout ─────────────────────────────────────────────────────

const DOT_LAYOUTS: Record<number, Array<{ top: string; left: string }>> = {
  1: [{ top: '50%', left: '50%' }],
  2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
  3: [{ top: '20%', left: '20%' }, { top: '50%', left: '50%' }, { top: '80%', left: '80%' }],
  4: [
    { top: '25%', left: '25%' }, { top: '25%', left: '75%' },
    { top: '75%', left: '25%' }, { top: '75%', left: '75%' },
  ],
  5: [
    { top: '25%', left: '25%' }, { top: '25%', left: '75%' },
    { top: '50%', left: '50%' },
    { top: '75%', left: '25%' }, { top: '75%', left: '75%' },
  ],
  6: [
    { top: '20%', left: '25%' }, { top: '20%', left: '75%' },
    { top: '50%', left: '25%' }, { top: '50%', left: '75%' },
    { top: '80%', left: '25%' }, { top: '80%', left: '75%' },
  ],
};

/** Maps a die face number to the CSS rotation needed to show that face front */
const FACE_ROTATIONS: Record<number, { rotateX: number; rotateY: number }> = {
  1: { rotateX: 0, rotateY: 0 },
  2: { rotateX: -90, rotateY: 0 },
  3: { rotateX: 0, rotateY: 90 },
  4: { rotateX: 0, rotateY: -90 },
  5: { rotateX: 90, rotateY: 0 },
  6: { rotateX: 180, rotateY: 0 },
};

interface DieFaceProps {
  value: number;
  faceIndex: number;
  highlighted?: boolean;
}

function DieFace({ value, highlighted }: DieFaceProps) {
  const dots = DOT_LAYOUTS[value] ?? DOT_LAYOUTS[1];
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background: highlighted
          ? 'radial-gradient(circle at 50% 40%, #fef3c7, #f59e0b)'
          : 'radial-gradient(circle at 50% 40%, #ffffff, #e2e8f0)',
        borderRadius: 8,
      }}
    >
      {dots.map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `calc(${pos.top} - 7px)`,
            left: `calc(${pos.left} - 7px)`,
            width: 14,
            height: 14,
            background: highlighted ? '#92400e' : '#1e293b',
            boxShadow: highlighted ? '0 0 4px rgba(245,158,11,0.6)' : '0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
      ))}
    </div>
  );
}

// ── Single 3D Die ─────────────────────────────────────────────────────────────

interface Dice3DProps {
  /** Size in px */
  size?: number;
  /** When provided, the die will animate to show this result */
  result?: number | null;
  /** If true, the die is spinning (rolling) */
  rolling?: boolean;
  onRollComplete?: (result: number) => void;
}

export function Dice3D({ size = 80, result = null, rolling = false, onRollComplete }: Dice3DProps) {
  const [currentRotation, setCurrentRotation] = useState({ rotateX: 15, rotateY: 15 });
  const [isSpinning, setIsSpinning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rolling && !result) {
      // Start spinning randomly
      setIsSpinning(true);
      let step = 0;
      intervalRef.current = setInterval(() => {
        step += 1;
        setCurrentRotation({
          rotateX: step * 137,
          rotateY: step * 97,
        });
      }, 80);
    } else if (result && !rolling) {
      // Land on target face
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsSpinning(false);
      const target = FACE_ROTATIONS[result] ?? FACE_ROTATIONS[1];
      // Add a big spin before landing (360*3 + target)
      setCurrentRotation({
        rotateX: 360 * 3 + target.rotateX,
        rotateY: 360 * 3 + target.rotateY,
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rolling, result]);

  const s = size;
  const half = s / 2;

  return (
    <div
      style={{ width: s, height: s, perspective: s * 4, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))' }}
      className="select-none"
    >
      <motion.div
        animate={{
          rotateX: currentRotation.rotateX,
          rotateY: currentRotation.rotateY,
        }}
        transition={
          isSpinning
            ? { duration: 0.08, ease: 'linear' }
            : { duration: 0.9, ease: [0.2, 0.9, 0.3, 1.0] }
        }
        onAnimationComplete={() => {
          if (result && !rolling) {
            onRollComplete?.(result);
          }
        }}
        style={{
          width: s,
          height: s,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Front — 1 */}
        <div style={{ position: 'absolute', width: s, height: s, transform: `translateZ(${half}px)`, boxShadow: '0 0 10px rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <DieFace value={1} faceIndex={0} highlighted={result === 1} />
        </div>
        {/* Back — 6 */}
        <div style={{ position: 'absolute', width: s, height: s, transform: `rotateY(180deg) translateZ(${half}px)`, boxShadow: '0 0 10px rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <DieFace value={6} faceIndex={5} highlighted={result === 6} />
        </div>
        {/* Top — 2 */}
        <div style={{ position: 'absolute', width: s, height: s, transform: `rotateX(90deg) translateZ(${half}px)`, boxShadow: '0 0 10px rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <DieFace value={2} faceIndex={1} highlighted={result === 2} />
        </div>
        {/* Bottom — 5 */}
        <div style={{ position: 'absolute', width: s, height: s, transform: `rotateX(-90deg) translateZ(${half}px)`, boxShadow: '0 0 10px rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <DieFace value={5} faceIndex={4} highlighted={result === 5} />
        </div>
        {/* Right — 3 */}
        <div style={{ position: 'absolute', width: s, height: s, transform: `rotateY(-90deg) translateZ(${half}px)`, boxShadow: '0 0 10px rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <DieFace value={3} faceIndex={2} highlighted={result === 3} />
        </div>
        {/* Left — 4 */}
        <div style={{ position: 'absolute', width: s, height: s, transform: `rotateY(90deg) translateZ(${half}px)`, boxShadow: '0 0 10px rgba(0,0,0,0.4)', borderRadius: 8 }}>
          <DieFace value={4} faceIndex={3} highlighted={result === 4} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Multi-dice roll component ─────────────────────────────────────────────────

interface DiceGroupProps {
  /** Number of dice */
  count?: number;
  size?: number;
  results?: number[] | null;
  rolling?: boolean;
  onAllComplete?: (results: number[]) => void;
}

export function DiceGroup({
  count = 2,
  size = 80,
  results = null,
  rolling = false,
  onAllComplete,
}: DiceGroupProps) {
  const completedRef = useRef(0);

  const handleComplete = () => {
    completedRef.current += 1;
    if (completedRef.current >= count && results) {
      completedRef.current = 0;
      onAllComplete?.(results);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Dice3D
            size={size}
            result={results?.[i] ?? null}
            rolling={rolling}
            onRollComplete={handleComplete}
          />
          {results?.[i] && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-white"
            >
              {results[i]}
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}
