import { useCallback, useMemo, useState } from 'react';
import { createPlan, type SimklMediaTypeFilter } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { HorizontalSlider } from '@/components/shared/horizontal-slider';
import { IdeaCard } from '@/features/plans/components/idea-card';
import { ReleaseFilterBar } from '@/features/plans/components/release-filter-bar';
import { ReleaseGrid, type ReleaseSortBy } from '@/features/plans/components/release-grid';
import { useCalendarData, useSavedPlans } from '@/features/plans/hooks/use-plans-data';
import { useRecommendations } from '@/features/plans/hooks/use-recommendations';
import { useWatchingActions } from '@/features/plans/hooks/use-watching-actions';
import {
  getCurrentSeasonRange,
  getSeasonLabel,
  getSeasonWeeks,
  type WeekRange,
} from '@/features/plans/utils/release-ranges';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';
import type { GenreFilter } from '@/lib/plans/anime-genres';
import { formatAirDate, formatAirTime } from '@/lib/plans/anime-utils';
const WATCHING_QUERY = { activityType: 'watching' as const };

export function CurrentReleases() {
  const { t, language } = useTranslation();

  const [sourceFilter, setSourceFilter] = useState<SimklMediaTypeFilter>('anime');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  const [weekFilter, setWeekFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ReleaseSortBy>('date');

  const dateRange = useMemo(() => getCurrentSeasonRange(), []);
  const seasonLabel = useMemo(() => getSeasonLabel(language), [language]);
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
  const showError = useTooltipStore((state) => state.showError);
  const { addToWatching, removeFromWatching } = useWatchingActions(setPlans);
  const { data: recommendations, isLoading: isLoadingReco } = useRecommendations('watching');

  const saveRecoItem = useCallback(
    async (calendarItemId: string) => {
      try {
        const plan = await createPlan({ calendarItemId });
        setPlans((prev) => (prev.find((p) => p.id === plan.id) ? prev : [...prev, plan]));
      } catch {
        showError(t('plans.createError'));
      }
    },
    [setPlans, showError, t],
  );

  const removeRecoItem = useCallback(
    async (calendarItemId: string) => {
      const plan = plans.find((p) => p.calendarItemId === calendarItemId);
      if (plan) await removeFromWatching(plan.id);
    },
    [plans, removeFromWatching],
  );
  const trendingSection = recommendations?.sections.find((section) => section.section === 'trending');
  const otherRecoSections =
    recommendations?.sections.filter((section) => section.section !== 'trending') ?? [];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-display-xs font-semibold text-primary">
            {t('plans.currentSeasonTitle', { season: seasonLabel })}
          </h2>
          <Badge color="brand" size="md">
            {seasonLabel}
          </Badge>
        </div>
        <p className="text-sm text-tertiary">{t('plans.currentSeasonSubtitle')}</p>
        {lastSyncedAt && (
          <p className="text-xs text-quaternary">
            {t('plans.lastSynced', {
              date: formatAirDate(lastSyncedAt, language),
              time: formatAirTime(lastSyncedAt, language),
            })}
          </p>
        )}
      </div>

      {!isLoadingReco && trendingSection && (
        <HorizontalSlider title={t('plans.trendingThisSeason')}>
          {trendingSection.items.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              index={index}
              compact
              showSaveAction
              detailHref={`/plans/watching/title/${idea.id}`}
              isSaved={plans.some((p) => p.calendarItemId === idea.id)}
              onSave={() => void saveRecoItem(idea.id)}
              onRemove={() => void removeRecoItem(idea.id)}
            />
          ))}
        </HorizontalSlider>
      )}

      {!isLoadingReco &&
        otherRecoSections.map((section) => (
          <HorizontalSlider key={section.section} title={section.title}>
            {section.items.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={index}
                compact
                showSaveAction
                detailHref={`/plans/watching/title/${idea.id}`}
                isSaved={plans.some((p) => p.calendarItemId === idea.id)}
                onSave={() => void saveRecoItem(idea.id)}
                onRemove={() => void removeRecoItem(idea.id)}
              />
            ))}
          </HorizontalSlider>
        ))}

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
        emptyMessageKey="plans.noCurrentSeasonItems"
        onAddToWatching={(item) => void addToWatching(item)}
        onRemoveFromWatching={(planId) => void removeFromWatching(planId)}
      />
    </section>
  );
}
