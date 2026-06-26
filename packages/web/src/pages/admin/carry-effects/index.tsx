import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trash01 } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { getCarryEffects, removeCarryEffect, type CarryEffect } from '@/api/cards';
import { useTooltipStore } from '@/store/useTooltipStore';

const DURATION_COLORS = {
  this_game: 'gray',
  next_game: 'sky',
  permanent: 'warning',
} as const;

export function CarryEffectsPage() {
  const [effects, setEffects] = useState<CarryEffect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showError = useTooltipStore((state) => state.showError);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getCarryEffects();
      setEffects(data);
    } catch {
      showError('Failed to load carry effects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this carry effect from the player?')) return;
    try {
      await removeCarryEffect(id);
      setEffects((prev) => prev.filter((e) => e.id !== id));
    } catch {
      showError('Failed to remove carry effect.');
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h1 className="text-display-xs font-semibold text-primary">Carry Effects</h1>
        <p className="mt-1 text-sm text-tertiary">
          Cross-game persistent effects stored on player profiles. Loaded by GameRunner at next game start.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-tertiary">Loading…</div>
        ) : effects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <span className="text-3xl">✅</span>
            <p className="text-sm text-tertiary">No active carry effects.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/60 text-left">
                  <th className="px-4 py-3 font-medium text-tertiary">Player</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Effect</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Duration</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Source Card</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Game Session</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Earned</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {effects.map((effect, i) => (
                  <tr
                    key={effect.id}
                    className={`border-b border-secondary/40 transition-colors hover:bg-primary_hover ${
                      i % 2 === 0 ? 'bg-transparent' : 'bg-primary/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary">{effect.playerEmail ?? effect.playerId}</div>
                      <div className="text-xs text-quaternary font-mono truncate max-w-[140px]">
                        {effect.playerId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary">{effect.effectLabel}</div>
                      {effect.effectDescription && (
                        <div className="mt-0.5 text-xs text-tertiary truncate max-w-[200px]">
                          {effect.effectDescription}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        color={DURATION_COLORS[effect.duration as keyof typeof DURATION_COLORS] ?? 'gray'}
                        size="sm"
                      >
                        {effect.duration.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {effect.sourceCardName ? (
                        <div>
                          <div className="text-sm text-primary">{effect.sourceCardName}</div>
                          <div className="text-xs text-quaternary font-mono truncate max-w-[120px]">
                            {effect.sourceCardId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-quaternary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-tertiary font-mono truncate max-w-[120px]">
                      {effect.gameSessionId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-tertiary whitespace-nowrap">
                      {new Date(effect.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleRemove(effect.id)}
                        className="rounded-lg p-1.5 text-tertiary hover:bg-error/10 hover:text-error transition-colors"
                        title="Remove carry effect"
                      >
                        <Trash01 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}
