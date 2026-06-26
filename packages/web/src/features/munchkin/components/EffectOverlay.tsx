import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AnimationTrigger } from '@homekit/engine';

// ── Reduced-motion helper ─────────────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ── Particle engine (lazy) ────────────────────────────────────────────────────

let engineReady = false;
let enginePromise: Promise<void> | null = null;

type IOptions = Record<string, unknown>;

async function ensureEngine(): Promise<void> {
  if (engineReady) return;
  if (!enginePromise) {
    enginePromise = (async () => {
      const { initParticlesEngine } = await import('@tsparticles/react');
      const { loadSlim } = await import('@tsparticles/slim');
      await initParticlesEngine(async (engine: unknown) => {
        await loadSlim(engine as Parameters<typeof loadSlim>[0]);
      });
      engineReady = true;
    })();
  }
  return enginePromise;
}

const ELEMENT_CONFIGS: Record<string, IOptions> = {
  fire: {
    particles: {
      number: { value: 60 },
      color: { value: ['#ff4400', '#ff8800', '#ffcc00'] },
      shape: { type: 'circle' },
      size: { value: { min: 4, max: 10 } },
      opacity: { value: 0.8, animation: { enable: true, speed: 1, minimumValue: 0 } },
      move: { enable: true, speed: 3, direction: 'top', outModes: { default: 'destroy' }, random: true },
      life: { count: 1, duration: { value: 1.5 } },
    },
    emitters: { position: { x: 50, y: 80 }, size: { width: 80, height: 5 } },
  },
  burst_red: {
    particles: {
      number: { value: 30 },
      color: { value: '#ff0000' },
      shape: { type: 'circle' },
      size: { value: { min: 5, max: 15 } },
      opacity: { value: 0.8, animation: { enable: true, speed: 2, minimumValue: 0 } },
      move: { enable: true, speed: 5, direction: 'outside', outModes: { default: 'destroy' } },
      life: { count: 1, duration: { value: 1.5 } },
    },
    emitters: { position: { x: 50, y: 50 }, size: { width: 10, height: 10 } },
  },
  burst_gold: {
    particles: {
      number: { value: 50 },
      color: { value: ['#ffd700', '#ffaa00', '#ffffaa'] },
      shape: { type: 'star' },
      size: { value: { min: 4, max: 10 } },
      opacity: { value: 0.9, animation: { enable: true, speed: 2, minimumValue: 0 } },
      move: { enable: true, speed: 4, direction: 'outside', outModes: { default: 'destroy' } },
      life: { count: 1, duration: { value: 1.5 } },
    },
    emitters: { position: { x: 50, y: 50 }, size: { width: 10, height: 10 } },
  },
};

function getConfigKey(trigger: AnimationTrigger): string | null {
  switch (trigger.type) {
    case 'effect_fire': return 'fire';
    case 'curse':
    case 'combat_lose': return 'burst_red';
    case 'loot':
    case 'combat_win': return 'burst_gold';
    default: return null;
  }
}

// ── Toast for combat_win ──────────────────────────────────────────────────────

function CombatWinToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pointer-events-none absolute left-1/2 top-6 z-60 -translate-x-1/2"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/20 px-4 py-2 text-sm font-bold text-success shadow-lg shadow-success/20">
        ⚔ Victory!
      </span>
    </motion.div>
  );
}

// ── Screen shake + red vignette for combat_lose / curse ────────────────────────

function CurseOverlay() {
  return (
    <>
      {/* Red vignette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0.25, 0] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.55) 100%)',
        }}
      />
    </>
  );
}

// ── Loot shimmer badge ────────────────────────────────────────────────────────

function LootShimmerBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.1, 1, 0.9] }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pointer-events-none absolute left-1/2 top-1/2 z-60 -translate-x-1/2 -translate-y-1/2"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-5 py-2.5 text-sm font-bold text-amber-300 shadow-lg shadow-amber-500/30">
        🎁 Loot!
      </span>
    </motion.div>
  );
}

// ── Particles wrapper (lazy rendered) ─────────────────────────────────────────

function ParticlesBurst({
  configKey,
  triggerId,
}: {
  configKey: string;
  triggerId: string;
}) {
  const [ParticlesComponent, setParticlesComponent] = useState<
    React.ComponentType<{ id: string; options: IOptions; className: string }> | null
  >(null);
  const [ready, setReady] = useState(engineReady);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureEngine();
      if (cancelled) return;
      const mod = await import('@tsparticles/react');
      if (cancelled) return;
      setParticlesComponent(() => mod.default as typeof ParticlesComponent);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!ready || !ParticlesComponent) return null;
  const config = ELEMENT_CONFIGS[configKey];
  if (!config) return null;

  return (
    <ParticlesComponent
      id={`effect-${configKey}-${triggerId}`}
      options={config}
      className="absolute inset-0"
    />
  );
}

// ── Main EffectOverlay component ──────────────────────────────────────────────

interface EffectOverlayProps {
  trigger: AnimationTrigger;
}

export function EffectOverlay({ trigger }: EffectOverlayProps) {
  const reduced = prefersReducedMotion();
  const configKey = getConfigKey(trigger);
  const idRef = useRef(`${trigger.type}-${Date.now()}`);

  const isCombatWin = trigger.type === 'combat_win';
  const isCurse = trigger.type === 'curse' || trigger.type === 'combat_lose';
  const isLoot = trigger.type === 'loot';

  // Screen shake: applies a css class on the root for combat_lose/curse
  useEffect(() => {
    if (reduced || (!isCurse)) return;
    const root = document.getElementById('root') ?? document.body;
    root.style.animation = 'screen-shake 0.3s ease-out';
    const t = setTimeout(() => { root.style.animation = ''; }, 300);
    return () => { clearTimeout(t); root.style.animation = ''; };
  }, [isCurse, reduced]);

  if (reduced) {
    // Static fallback: just show a badge
    return (
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
        {isCombatWin && (
          <span className="rounded-full border border-success/30 bg-success/20 px-4 py-2 text-sm font-bold text-success">
            Victory
          </span>
        )}
        {isCurse && (
          <span className="rounded-full border border-error/30 bg-error/10 px-4 py-2 text-sm font-bold text-error">
            Cursed
          </span>
        )}
        {isLoot && (
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-300">
            Loot
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-0 z-50"
    >
      {/* Particles burst */}
      {configKey && (
        <ParticlesBurst configKey={configKey} triggerId={idRef.current} />
      )}

      {/* Combat WIN: gold glow pulse + toast */}
      <AnimatePresence>
        {isCombatWin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute inset-0 bg-amber-400/20"
            />
            <CombatWinToast />
          </>
        )}
      </AnimatePresence>

      {/* Combat LOSE / curse: vignette */}
      <AnimatePresence>
        {isCurse && <CurseOverlay />}
      </AnimatePresence>

      {/* LOOT: shimmer badge */}
      <AnimatePresence>
        {isLoot && <LootShimmerBadge />}
      </AnimatePresence>
    </motion.div>
  );
}
