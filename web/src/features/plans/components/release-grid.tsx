import { motion, useInView } from 'motion/react';
import { useMemo, useRef } from 'react';
import type { CalendarItem, Plan } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { CardContent } from '@/components/base/card/card';
import { EmptyStateIllustration } from '@/components/shared/animated-icon';
import { ContentLoader, ReleaseCardSkeleton } from '@/components/shared/skeleton';
import { useTranslation } from '@/lib/i18n/use-translation';
import { matchesGenreFilter, type GenreFilter } from '@/lib/plans/anime-genres';
import { getPlanForItem, getQualityScore, groupCalendarByMonth } from '@/lib/plans/anime-utils';
import type { WeekRange } from '../utils/release-ranges';
import { ReleaseCard } from './release-card';

export type ReleaseSortBy = 'date' | 'rating';

export const releaseGridClassName =
  'grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';

interface ReleaseGridProps {
  items: CalendarItem[];
  savedPlans: Plan[];
  isLoading: boolean;
  genreFilter?: GenreFilter;
  weekRange?: WeekRange | null;
  searchQuery?: string;
  sortBy?: ReleaseSortBy;
  emptyMessageKey?: string;
  onAddToWatching: (item: CalendarItem) => void;
  onRemoveFromWatching: (planId: string) => void;
}

function MonthSection({
  group,
  groupIndex,
  savedPlans,
  onAddToWatching,
  onRemoveFromWatching,
}: {
  group: { month: string; items: CalendarItem[] };
  groupIndex: number;
  savedPlans: Plan[];
  onAddToWatching: (item: CalendarItem) => void;
  onRemoveFromWatching: (planId: string) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: groupIndex * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-primary">{group.month}</h3>
        <Badge color="gray" size="sm">
          {group.items.length}
        </Badge>
      </div>
      <div className={releaseGridClassName}>
        {group.items.map((item, itemIndex) => {
          const plan = getPlanForItem(item.id, savedPlans);
          return (
            <motion.div
              key={`${item.id}-${item.airDate}`}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: groupIndex * 0.08 + itemIndex * 0.04 }}
            >
              <ReleaseCard
                item={item}
                plan={plan}
                isWatching={Boolean(plan)}
                onAddToWatching={onAddToWatching}
                onRemoveFromWatching={onRemoveFromWatching}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function matchesWeekRange(item: CalendarItem, weekRange: WeekRange | null | undefined): boolean {
  if (!weekRange) return true;

  const airDateStr = item.airDate.slice(0, 10);

  // Primary: airDate falls directly in the week
  if (airDateStr >= weekRange.from && airDateStr <= weekRange.to) return true;

  // For ongoing/airing weekly anime: check if a new episode airs in the selected week.
  // We use nextEpisodeAiringAt as the reference for weekly cadence.
  const isOngoing =
    item.airingStatus === 'ongoing' ||
    item.airingStatus === 'RELEASING' ||
    item.airingStatus === 'releasing';

  if (!isOngoing) return false;

  const nextEpDateStr = item.nextEpisodeAiringAt?.slice(0, 10) ?? null;
  if (!nextEpDateStr) return false;

  // nextEpisodeAiringAt directly in the week
  if (nextEpDateStr >= weekRange.from && nextEpDateStr <= weekRange.to) return true;

  // Project forward/backward in 7-day steps from nextEpisodeAiringAt to see if any
  // episode lands in the requested week range.
  const nextMs = new Date(nextEpDateStr).getTime();
  const rangeFromMs = new Date(weekRange.from).getTime();
  const rangeToMs = new Date(weekRange.to).getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  if (nextMs > rangeToMs) {
    // next episode is in the future — step back
    const stepsBack = Math.ceil((nextMs - rangeToMs) / weekMs);
    const projected = nextMs - stepsBack * weekMs;
    return projected >= rangeFromMs && projected <= rangeToMs;
  }

  // next episode is in the past — step forward
  const stepsForward = Math.ceil((rangeFromMs - nextMs) / weekMs);
  const projected = nextMs + stepsForward * weekMs;
  return projected >= rangeFromMs && projected <= rangeToMs;
}

function matchesSearch(item: CalendarItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    (item.titleEn?.toLowerCase().includes(q) ?? false) ||
    (item.titleUa?.toLowerCase().includes(q) ?? false)
  );
}

export function ReleaseGrid({
  items,
  savedPlans,
  isLoading,
  genreFilter = 'all',
  weekRange = null,
  searchQuery = '',
  sortBy = 'date',
  emptyMessageKey = 'plans.noCalendarItems',
  onAddToWatching,
  onRemoveFromWatching,
}: ReleaseGridProps) {
  const { t, language } = useTranslation();
  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesGenreFilter(item.genres, genreFilter) &&
          matchesWeekRange(item, weekRange) &&
          matchesSearch(item, searchQuery),
      ),
    [genreFilter, items, weekRange, searchQuery],
  );

  const sortedByRating = useMemo(() => {
    if (sortBy !== 'rating') return null;
    return [...filteredItems].sort((a, b) => {
      const scoreA = getQualityScore(a);
      const scoreB = getQualityScore(b);
      // Items with no rating data go to the bottom
      if (scoreA === 0 && scoreB === 0) return 0;
      if (scoreA === 0) return 1;
      if (scoreB === 0) return -1;
      return scoreB - scoreA;
    });
  }, [filteredItems, sortBy]);

  const groupedItems = useMemo(
    () => (sortBy === 'date' ? groupCalendarByMonth(filteredItems, language) : null),
    [filteredItems, language, sortBy],
  );

  if (isLoading) {
    return (
      <div className={releaseGridClassName}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ReleaseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="glass-card">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <EmptyStateIllustration />
          <p className="text-sm text-tertiary">{t(emptyMessageKey)}</p>
        </CardContent>
      </div>
    );
  }

  if (sortBy === 'rating' && sortedByRating) {
    return (
      <div className={releaseGridClassName}>
        {sortedByRating.map((item, index) => {
          const plan = getPlanForItem(item.id, savedPlans);
          return (
            <motion.div
              key={`${item.id}-${item.airDate}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <ReleaseCard
                item={item}
                plan={plan}
                isWatching={Boolean(plan)}
                onAddToWatching={onAddToWatching}
                onRemoveFromWatching={onRemoveFromWatching}
              />
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groupedItems!.map((group, groupIndex) => (
        <MonthSection
          key={group.month}
          group={group}
          groupIndex={groupIndex}
          savedPlans={savedPlans}
          onAddToWatching={onAddToWatching}
          onRemoveFromWatching={onRemoveFromWatching}
        />
      ))}
    </div>
  );
}

export const watchingGridClassName = releaseGridClassName;
