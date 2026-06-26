import { cx } from '@/utils/cx';
import type { CardStats, CardType, EffectDefinition, EffectInstance } from '@/api/cards';

export interface CardFaceProps {
  type?: CardType;
  subtype?: string;
  name?: string;
  description?: string;
  flavorText?: string;
  imageUrl?: string;
  stats?: CardStats;
  effects?: EffectInstance[];
  effectDefinitions?: EffectDefinition[];
  enabled?: boolean;
  className?: string;
}

const TYPE_PALETTE: Record<string, { bg: string; badge: string; border: string }> = {
  DOOR: {
    bg: 'from-amber-950 to-amber-900',
    badge: 'bg-amber-600 text-amber-50',
    border: 'border-amber-700/60',
  },
  TREASURE: {
    bg: 'from-yellow-950 to-yellow-900',
    badge: 'bg-yellow-500 text-yellow-950',
    border: 'border-yellow-600/60',
  },
  PARTY: {
    bg: 'from-violet-950 to-violet-900',
    badge: 'bg-violet-500 text-violet-50',
    border: 'border-violet-700/60',
  },
  SITUATION: {
    bg: 'from-sky-950 to-sky-900',
    badge: 'bg-sky-500 text-sky-50',
    border: 'border-sky-700/60',
  },
  MINIGAME: {
    bg: 'from-rose-950 to-rose-900',
    badge: 'bg-rose-500 text-rose-50',
    border: 'border-rose-700/60',
  },
};

const EFFECT_ICONS: Record<string, string> = {
  progress: '⬆',
  inventory: '🎒',
  loot: '🃏',
  turn: '🔄',
  combat: '⚔',
  situation: '😂',
  quest: '📜',
  gm: '🎲',
};

function EffectChip({
  instance,
  definitions,
}: {
  instance: EffectInstance;
  definitions?: EffectDefinition[];
}) {
  const def = definitions?.find((d) => d.id === instance.definitionId);
  if (!def) return null;

  const icon = EFFECT_ICONS[def.category] ?? '•';
  const paramStr = def.params
    .filter((p) => instance.params[p.key] !== undefined && instance.params[p.key] !== '')
    .map((p) => String(instance.params[p.key]))
    .join(', ');

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80">
      <span>{icon}</span>
      <span>{def.label}{paramStr ? `: ${paramStr}` : ''}</span>
    </span>
  );
}

export function CardFace({
  type = 'DOOR',
  subtype,
  name,
  description,
  flavorText,
  imageUrl,
  stats,
  effects = [],
  effectDefinitions = [],
  enabled = true,
  className,
}: CardFaceProps) {
  const palette = TYPE_PALETTE[type] ?? TYPE_PALETTE.DOOR;

  return (
    <div
      className={cx(
        'relative flex w-[200px] flex-col overflow-hidden rounded-2xl border',
        `bg-gradient-to-b ${palette.bg}`,
        palette.border,
        !enabled && 'opacity-50 grayscale',
        className,
      )}
      style={{ aspectRatio: '2/3' }}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between px-2.5 pt-2.5">
        <span className={cx('rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', palette.badge)}>
          {subtype ?? type}
        </span>
        {!enabled && (
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] text-white/50 uppercase">
            disabled
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="mx-2 mt-2 overflow-hidden rounded-lg" style={{ aspectRatio: '4/3' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name ?? 'Card'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5">
            <span className="text-3xl opacity-30">🃏</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5 pt-1.5">
        {/* Name */}
        <p className="text-[11px] font-bold leading-tight text-white truncate">
          {name || <span className="opacity-30">Card Name</span>}
        </p>

        {/* Stats row */}
        {(stats?.monsterLevel || stats?.goldValue != null || stats?.combatBonus != null) && (
          <div className="flex items-center gap-1.5 text-[9px] text-white/70">
            {stats.monsterLevel && <span>Lv.{stats.monsterLevel}</span>}
            {stats.goldValue != null && <span>💰 {stats.goldValue}</span>}
            {stats.combatBonus != null && stats.combatBonus !== 0 && (
              <span>⚔ {stats.combatBonus > 0 ? '+' : ''}{stats.combatBonus}</span>
            )}
            {stats.treasureReward != null && stats.treasureReward > 0 && (
              <span>🎁 {stats.treasureReward}</span>
            )}
          </div>
        )}

        {/* Divider */}
        {description && <div className="border-t border-white/10" />}

        {/* Description */}
        {description && (
          <p className="text-[9px] leading-relaxed text-white/80 line-clamp-4">{description}</p>
        )}

        {/* Effects */}
        {effects.length > 0 && (
          <>
            <div className="border-t border-white/10" />
            <div className="flex flex-wrap gap-0.5">
              {effects.map((eff, i) => (
                <EffectChip key={i} instance={eff} definitions={effectDefinitions} />
              ))}
            </div>
          </>
        )}

        {/* Flavor text */}
        {flavorText && (
          <>
            <div className="border-t border-white/10" />
            <p className="text-[8px] italic leading-relaxed text-white/50 line-clamp-2">
              "{flavorText}"
            </p>
          </>
        )}
      </div>
    </div>
  );
}
