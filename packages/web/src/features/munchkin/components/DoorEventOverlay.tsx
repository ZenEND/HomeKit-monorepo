import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { DiceRollState, DiceOutcomeTier } from '@homekit/engine';
import { DiceGroup } from './Dice3D';
import { cx } from '@/utils/cx';

// ── Outcome styling ───────────────────────────────────────────────────────────

const OUTCOME_STYLES: Record<string, { bg: string; border: string; text: string; glow: string; icon: string }> = {
  critical_success: {
    bg: 'bg-gradient-to-br from-yellow-900/80 to-amber-800/60',
    border: 'border-amber-400/60',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.5)]',
    icon: '✨',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-900/80 to-emerald-800/60',
    border: 'border-green-400/60',
    text: 'text-green-300',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
    icon: '✅',
  },
  partial: {
    bg: 'bg-gradient-to-br from-slate-800/80 to-gray-700/60',
    border: 'border-gray-500/60',
    text: 'text-gray-300',
    glow: '',
    icon: '⚠️',
  },
  fail: {
    bg: 'bg-gradient-to-br from-orange-900/80 to-red-900/60',
    border: 'border-orange-500/60',
    text: 'text-orange-300',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    icon: '❌',
  },
  critical_fail: {
    bg: 'bg-gradient-to-br from-red-950/90 to-red-900/70',
    border: 'border-red-500/60',
    text: 'text-red-400',
    glow: 'shadow-[0_0_50px_rgba(239,68,68,0.6)]',
    icon: '💀',
  },
};

// ── Outcome effect labels ─────────────────────────────────────────────────────

function formatEffect(eff: { type: string; amount?: number; target?: string; customText?: string }): string {
  const who = eff.target === 'all' ? 'All players' : eff.target === 'active_player' ? 'You' : eff.target ?? 'You';
  switch (eff.type) {
    case 'gain_level': return `${who} +${eff.amount ?? 1} level`;
    case 'lose_level': return `${who} -${eff.amount ?? 1} level`;
    case 'draw_treasure': return `${who} draw ${eff.amount ?? 1} Treasure`;
    case 'draw_door': return `${who} draw ${eff.amount ?? 1} Door card`;
    case 'gain_gold': return `${who} +${eff.amount ?? 100} gold`;
    case 'lose_gold': return `${who} -${eff.amount ?? 100} gold`;
    case 'discard_item': return `${who} discard 1 equipped item`;
    case 'skip_turn': return `${who} skip next turn`;
    case 'custom_text': return eff.customText ?? '';
    default: return eff.type;
  }
}

// ── Tier display ─────────────────────────────────────────────────────────────

interface TierBadgeProps {
  tier: DiceOutcomeTier;
  isActive: boolean;
}

function TierBadge({ tier, isActive }: TierBadgeProps) {
  const style = OUTCOME_STYLES[tier.key] ?? OUTCOME_STYLES.partial;
  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.04, 1] } : {}}
      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}
      className={cx(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all',
        style.border,
        isActive ? `${style.bg} ${style.glow}` : 'border-white/10 bg-white/5',
      )}
    >
      <span className="text-sm">{style.icon}</span>
      <div className="min-w-0">
        <span className={cx('text-xs font-semibold', isActive ? style.text : 'text-white/40')}>
          {tier.label}
        </span>
        <span className="ml-2 text-xs text-white/25">
          {tier.minRoll}{tier.maxRoll ? `–${tier.maxRoll}` : '+'}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main overlay ──────────────────────────────────────────────────────────────

interface DoorEventOverlayProps {
  diceRollState: DiceRollState;
  isActivePlayer: boolean;
  onRoll: () => void;
  onResolve: () => void;
}

type Stage = 'reading' | 'rolling' | 'result';

export function DoorEventOverlay({
  diceRollState,
  isActivePlayer,
  onRoll,
  onResolve,
}: DoorEventOverlayProps) {
  const [stage, setStage] = useState<Stage>(
    diceRollState.rollResult ? 'result' : 'reading',
  );
  const [localRolling, setLocalRolling] = useState(false);
  const [localResults, setLocalResults] = useState<number[] | null>(diceRollState.rollResult);
  const [allDoneAnimating, setAllDoneAnimating] = useState(!!diceRollState.rollResult);

  const { config, cardName, situationText, resolvedTier } = diceRollState;
  const total = localResults?.reduce((a, b) => a + b, 0) ?? null;

  const activeTier =
    resolvedTier ??
    (total !== null
      ? [...config.tiers]
          .sort((a, b) => b.minRoll - a.minRoll)
          .find((t) => total >= t.minRoll && (t.maxRoll === null || total <= t.maxRoll)) ?? null
      : null);

  const outcomeStyle = activeTier ? OUTCOME_STYLES[activeTier.key] ?? OUTCOME_STYLES.partial : null;

  const handleRoll = () => {
    if (!isActivePlayer || localRolling) return;
    const results = Array.from({ length: config.diceCount }, () =>
      Math.floor(Math.random() * 6) + 1,
    );
    setLocalRolling(true);
    setLocalResults(results);
    setStage('rolling');
    onRoll();
  };

  const handleDiceComplete = () => {
    setLocalRolling(false);
    setAllDoneAnimating(true);
    setStage('result');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Dramatic backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative z-10 mx-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d1117] shadow-2xl"
      >
        {/* Card name header */}
        <div className="border-b border-white/10 bg-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚪</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Door Event</p>
              <h2 className="text-xl font-bold text-white">{cardName}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-6">
          {/* Situation text */}
          <AnimatePresence mode="wait">
            {stage === 'reading' && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
                  {situationText}
                </p>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Dice: {config.diceCount}{config.diceType}
                  </p>
                  <div className="flex flex-col gap-1">
                    {config.tiers.map((tier) => (
                      <TierBadge key={tier.key} tier={tier} isActive={false} />
                    ))}
                  </div>
                </div>

                {isActivePlayer && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRoll}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-900/50 hover:from-amber-500 hover:to-orange-500"
                  >
                    🎲 Roll {config.diceCount}{config.diceType}!
                  </motion.button>
                )}
                {!isActivePlayer && (
                  <p className="mt-4 text-center text-sm text-white/30">
                    Waiting for the active player to roll...
                  </p>
                )}
              </motion.div>
            )}

            {(stage === 'rolling' || stage === 'result') && (
              <motion.div
                key="rolling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                {/* 3D Dice */}
                <DiceGroup
                  count={config.diceCount}
                  size={100}
                  results={localResults}
                  rolling={localRolling && !allDoneAnimating}
                  onAllComplete={handleDiceComplete}
                />

                {/* Total */}
                <AnimatePresence>
                  {stage === 'result' && total !== null && (
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="text-center"
                    >
                      <p className="text-xs text-white/40 uppercase tracking-widest">Total Roll</p>
                      <p className="text-6xl font-black text-white">{total}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Outcome reveal */}
                <AnimatePresence>
                  {stage === 'result' && activeTier && outcomeStyle && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
                      className={cx(
                        'w-full rounded-2xl border p-4',
                        outcomeStyle.bg,
                        outcomeStyle.border,
                        outcomeStyle.glow,
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xl">{outcomeStyle.icon}</span>
                        <span className={cx('text-base font-bold', outcomeStyle.text)}>
                          {activeTier.label}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {activeTier.description}
                      </p>
                      {activeTier.effects.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {activeTier.effects.map((eff, i) => (
                            <span
                              key={i}
                              className={cx(
                                'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                outcomeStyle.border,
                                outcomeStyle.text,
                                'bg-black/20',
                              )}
                            >
                              {formatEffect(eff)}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tier reference */}
                {stage === 'result' && (
                  <div className="w-full">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
                      All Outcomes
                    </p>
                    <div className="flex flex-col gap-1">
                      {config.tiers.map((tier) => (
                        <TierBadge
                          key={tier.key}
                          tier={tier}
                          isActive={activeTier?.key === tier.key}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolve button */}
                {isActivePlayer && stage === 'result' && activeTier && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onResolve}
                    className={cx(
                      'w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg',
                      activeTier.key === 'critical_fail' || activeTier.key === 'fail'
                        ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600'
                        : 'bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600',
                    )}
                  >
                    Apply Outcome & Continue
                  </motion.button>
                )}
                {!isActivePlayer && stage === 'result' && (
                  <p className="text-center text-sm text-white/30">
                    Waiting for active player to apply outcome...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
