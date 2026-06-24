import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { PlanStatusFilter } from '@/api/plans';
import { ReleaseCardSkeleton } from '@/components/shared/skeleton';
import { WatchingCard, WatchingEmptyState } from '@/features/plans/components/watching-card';
import {
  WatchingFilterBar,
  type SeasonFilter,
} from '@/features/plans/components/watching-filter-bar';
import { useSavedPlans } from '@/features/plans/hooks/use-plans-data';
import { useWatchingActions } from '@/features/plans/hooks/use-watching-actions';
import { getCurrentSeasonQueryRange } from '@/features/plans/utils/release-ranges';
import { useTranslation } from '@/lib/i18n/use-translation';

// Matches the Tailwind breakpoints in watchingGridClassName:
// grid-cols-2 | sm:grid-cols-3 (640) | lg:grid-cols-4 (1024) | xl:grid-cols-5 (1280) | 2xl:grid-cols-6 (1536)
function getColCount(): number {
  const w = window.innerWidth;
  if (w < 640) return 2;
  if (w < 1024) return 3;
  if (w < 1280) return 4;
  if (w < 1536) return 5;
  return 6;
}

const GRID_CLASS =
  'grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';

export function SavedWatchingPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<PlanStatusFilter>('all');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');
  const query = useMemo(() => {
    const seasonRange = seasonFilter === 'current' ? getCurrentSeasonQueryRange() : null;

    return {
      activityType: 'watching' as const,
      status: statusFilter === 'all' ? undefined : statusFilter,
      ...(seasonRange ? { from: seasonRange.from, to: seasonRange.to } : {}),
    };
  }, [seasonFilter, statusFilter]);

  const { plans, setPlans, isLoading } = useSavedPlans({ query });
  const { updatingId, deletingId, markWatched, markUnwatched, removeFromWatching } =
    useWatchingActions(setPlans);

  const [cols, setCols] = useState(getColCount);

  useEffect(() => {
    const onResize = () => setCols(getColCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const rowCount = Math.ceil(plans.length / cols);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 3,
  });

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-md font-semibold text-primary">{t('plans.watchingTitle')}</h2>
        <p className="text-xs text-tertiary">{t('plans.watchingSubtitle')}</p>
      </div>

      <WatchingFilterBar
        statusFilter={statusFilter}
        seasonFilter={seasonFilter}
        onStatusFilterChange={setStatusFilter}
        onSeasonFilterChange={setSeasonFilter}
      />

      {isLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ReleaseCardSkeleton key={i} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <WatchingEmptyState />
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: Math.min(virtualizer.getTotalSize(), window.innerHeight * 0.8) }}
        >
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const rowStart = virtualRow.index * cols;
              const rowItems = plans.slice(rowStart, rowStart + cols);

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className={GRID_CLASS}>
                    {rowItems.map((plan, colIndex) => {
                      const flatIndex = rowStart + colIndex;
                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.15,
                            delay: Math.min(flatIndex * 0.02, 0.3),
                          }}
                        >
                          <WatchingCard
                            plan={plan}
                            isUpdating={updatingId === plan.id}
                            isDeleting={deletingId === plan.id}
                            onMarkWatched={(id) => void markWatched(id)}
                            onMarkUnwatched={(id) => void markUnwatched(id)}
                            onRemove={(id) => void removeFromWatching(id)}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
