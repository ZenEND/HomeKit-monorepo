import { useMemo, useState } from 'react';
import type { SimklMediaTypeFilter } from '@/api/plans';
import { ReleaseFilterBar } from '@/features/plans/components/release-filter-bar';
import { ReleaseGrid, type ReleaseSortBy } from '@/features/plans/components/release-grid';
import { useCalendarData, useSavedPlans } from '@/features/plans/hooks/use-plans-data';
import { useWatchingActions } from '@/features/plans/hooks/use-watching-actions';
import {
  getUpcomingReleasesRange,
  getSeasonWeeks,
  type WeekRange,
} from '@/features/plans/utils/release-ranges';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { GenreFilter } from '@/lib/plans/anime-genres';
import { formatAirDate, formatAirTime } from '@/lib/plans/anime-utils';
const WATCHING_QUERY = { activityType: 'watching' as const };

export function UpcomingReleases() {
  const { t, language } = useTranslation();

  const [sourceFilter, setSourceFilter] = useState<SimklMediaTypeFilter>('anime');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  const [weekFilter, setWeekFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ReleaseSortBy>('date');

  const dateRange = useMemo(() => getUpcomingReleasesRange(), []);
  const weeks = useMemo(() => getSeasonWeeks(language), [language]);

  const weekRange = useMemo<WeekRange | null>(
    () => weeks.find((w) => w.from === weekFilter) ?? null,
    [weekFilter, weeks],
  );

  const handleSourceFilterChange = (source: SimklMediaTypeFilter) => {
    setSourceFilter(source);
    if (source !== 'anime' && source !== 'all') {
      setGenreFilter('all');
    }
  };

  const { plans, setPlans } = useSavedPlans({ query: WATCHING_QUERY });
  const { items, lastSyncedAt, isLoading } = useCalendarData({
    dateRange,
    sourceFilter,
  });
  const { addToWatching, removeFromWatching } = useWatchingActions(setPlans);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-display-xs font-semibold text-primary">{t('plans.upcomingTitle')}</h2>
        <p className="text-sm text-tertiary">{t('plans.upcomingSubtitle')}</p>
        {lastSyncedAt && (
          <p className="mt-1 text-xs text-quaternary">
            {t('plans.lastSynced', {
              date: formatAirDate(lastSyncedAt, language),
              time: formatAirTime(lastSyncedAt, language),
            })}
          </p>
        )}
      </div>

      <ReleaseFilterBar
        sourceFilter={sourceFilter}
        genreFilter={genreFilter}
        weekFilter={weekFilter}
        searchQuery={searchQuery}
        weeks={weeks}
        sortBy={sortBy}
        onSourceFilterChange={handleSourceFilterChange}
        onGenreFilterChange={setGenreFilter}
        onWeekFilterChange={setWeekFilter}
        onSearchQueryChange={setSearchQuery}
        onSortByChange={setSortBy}
      />

      <ReleaseGrid
        items={items}
        savedPlans={plans}
        isLoading={isLoading}
        genreFilter={genreFilter}
        weekRange={weekRange}
        searchQuery={searchQuery}
        sortBy={sortBy}
        emptyMessageKey="plans.noUpcomingItems"
        onAddToWatching={(item) => void addToWatching(item)}
        onRemoveFromWatching={(planId) => void removeFromWatching(planId)}
      />
    </section>
  );
}
