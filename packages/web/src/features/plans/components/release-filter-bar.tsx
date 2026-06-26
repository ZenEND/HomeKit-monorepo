import { RefreshCw05, SearchMd } from '@untitledui/icons';
import type { SimklMediaTypeFilter } from '@/api/plans';
import { Button } from '@/components/base/buttons/button';
import { NativeSelect } from '@/components/base/select/select-native';
import { useTranslation } from '@/lib/i18n/use-translation';
import { ANIME_GENRES, type GenreFilter } from '@/lib/plans/anime-genres';
import type { WeekRange } from '../utils/release-ranges';
import type { ReleaseSortBy } from './release-grid';
import { cx } from '@/utils/cx';

interface ReleaseFilterBarProps {
  sourceFilter: SimklMediaTypeFilter;
  genreFilter: GenreFilter;
  weekFilter: string | null;
  searchQuery: string;
  weeks: WeekRange[];
  sortBy?: ReleaseSortBy;
  isRefreshing?: boolean;
  showRefresh?: boolean;
  onSourceFilterChange: (source: SimklMediaTypeFilter) => void;
  onGenreFilterChange: (genre: GenreFilter) => void;
  onWeekFilterChange: (from: string | null) => void;
  onSearchQueryChange: (query: string) => void;
  onSortByChange?: (sort: ReleaseSortBy) => void;
  onRefresh?: () => void;
}

const SOURCE_OPTIONS: { value: SimklMediaTypeFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'anime', labelKey: 'plans.sourceAnime' },
  { value: 'tv', labelKey: 'plans.sourceTv' },
  { value: 'movie', labelKey: 'plans.sourceMovie' },
];

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
        active
          ? 'bg-brand-solid text-white shadow-sm'
          : 'bg-secondary text-secondary hover:bg-tertiary hover:text-primary',
      )}
    >
      {children}
    </button>
  );
}

export function ReleaseFilterBar({
  sourceFilter,
  genreFilter,
  weekFilter,
  searchQuery,
  weeks,
  sortBy = 'date',
  isRefreshing,
  showRefresh,
  onSourceFilterChange,
  onGenreFilterChange,
  onWeekFilterChange,
  onSearchQueryChange,
  onSortByChange,
  onRefresh,
}: ReleaseFilterBarProps) {
  const { t } = useTranslation();
  const showGenreFilter = sourceFilter === 'anime' || sourceFilter === 'all';

  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-secondary/60 bg-primary/80 px-4 py-3 backdrop-blur-md md:mx-0 md:rounded-xl md:border md:bg-primary/60">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchMd className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-quaternary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder={t('plans.searchPlaceholder')}
              className="w-full rounded-lg bg-secondary py-2 pl-9 pr-3 text-sm text-primary shadow-xs ring-1 ring-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {showRefresh && (
            <Button
              color="secondary"
              size="sm"
              iconLeading={RefreshCw05}
              isLoading={isRefreshing}
              onClick={onRefresh}
            >
              {t('plans.refresh')}
            </Button>
          )}
        </div>

        {/* Row 2: Type pills + Genre select */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-tertiary">{t('plans.filterSource')}:</span>
          <div className="flex flex-wrap gap-1.5">
            {SOURCE_OPTIONS.map((opt) => (
              <PillButton
                key={opt.value}
                active={sourceFilter === opt.value}
                onClick={() => onSourceFilterChange(opt.value)}
              >
                {t(opt.labelKey)}
              </PillButton>
            ))}
          </div>
          {showGenreFilter && (
            <NativeSelect
              size="sm"
              className="ml-auto min-w-28"
              value={genreFilter}
              onChange={(e) => onGenreFilterChange(e.target.value as GenreFilter)}
              options={[
                { label: t('common.all'), value: 'all' },
                ...ANIME_GENRES.map((g) => ({ label: g, value: g })),
              ]}
            />
          )}
        </div>

        {/* Row 3: Sort */}
        {onSortByChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-tertiary">{t('plans.filterSort')}:</span>
            <div className="flex gap-1.5">
              <PillButton active={sortBy === 'date'} onClick={() => onSortByChange('date')}>
                {t('plans.sortByDate')}
              </PillButton>
              <PillButton active={sortBy === 'rating'} onClick={() => onSortByChange('rating')}>
                {t('plans.sortByRating')}
              </PillButton>
            </div>
          </div>
        )}

        {/* Row 4: Week chips */}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-tertiary">{t('plans.filterWeek')}:</span>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            <PillButton active={weekFilter === null} onClick={() => onWeekFilterChange(null)}>
              {t('plans.weekAll')}
            </PillButton>
            {weeks.map((week) => (
              <PillButton
                key={week.from}
                active={weekFilter === week.from}
                onClick={() => onWeekFilterChange(week.from)}
              >
                {week.label}
              </PillButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
