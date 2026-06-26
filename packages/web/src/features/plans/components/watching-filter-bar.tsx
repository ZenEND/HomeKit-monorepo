import { motion } from 'motion/react';
import type { PlanStatusFilter } from '@/api/plans';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

export type SeasonFilter = 'all' | 'current';

interface WatchingFilterBarProps {
  statusFilter: PlanStatusFilter;
  seasonFilter: SeasonFilter;
  onStatusFilterChange: (status: PlanStatusFilter) => void;
  onSeasonFilterChange: (season: SeasonFilter) => void;
}

interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface PillGroupProps<T extends string> {
  label: string;
  value: T;
  options: PillOption<T>[];
  layoutId: string;
  onChange: (value: T) => void;
}

function PillGroup<T extends string>({
  label,
  value,
  options,
  layoutId,
  onChange,
}: PillGroupProps<T>) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5" role="group" aria-label={label}>
      <span className="text-xs font-medium text-quaternary">{label}</span>
      <div className="relative flex items-center gap-1 rounded-xl bg-primary/40 p-1">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              aria-label={`${label}: ${option.label}`}
              onClick={() => onChange(option.value)}
              className={cx(
                'relative shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200',
                isActive ? 'text-brand-secondary' : 'text-tertiary hover:text-secondary_hover',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg bg-brand-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WatchingFilterBar({
  statusFilter,
  seasonFilter,
  onStatusFilterChange,
  onSeasonFilterChange,
}: WatchingFilterBarProps) {
  const { t } = useTranslation();

  const statusOptions: PillOption<PlanStatusFilter>[] = [
    { value: 'all', label: t('common.all') },
    { value: 'planned', label: t('plans.statusPlanned') },
    { value: 'watched', label: t('plans.statusWatched') },
    { value: 'dropped', label: t('plans.statusDropped') },
  ];

  const seasonOptions: PillOption<SeasonFilter>[] = [
    { value: 'all', label: t('plans.seasonAll') },
    { value: 'current', label: t('plans.seasonCurrent') },
  ];

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-secondary/60 bg-secondary/80 px-4 py-3 backdrop-blur-md md:mx-0 md:rounded-xl md:border md:bg-primary/60">
      <div className="flex items-end gap-4 overflow-x-auto scrollbar-hide">
        <PillGroup
          label={t('plans.filterStatus')}
          value={statusFilter}
          options={statusOptions}
          layoutId="watching-status-pill"
          onChange={onStatusFilterChange}
        />
        <PillGroup
          label={t('plans.filterSeason')}
          value={seasonFilter}
          options={seasonOptions}
          layoutId="watching-season-pill"
          onChange={onSeasonFilterChange}
        />
      </div>
    </div>
  );
}
