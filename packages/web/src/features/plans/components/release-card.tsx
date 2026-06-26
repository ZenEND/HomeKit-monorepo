import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Eye, EyeOff } from '@untitledui/icons';
import type { CalendarItem, Plan } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { CardContent } from '@/components/base/card/card';
import { LazyImage } from '@/components/shared/lazy-image';
import { sliderCardClassName } from '@/components/shared/horizontal-slider';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  formatAirDate,
  formatAirTime,
  formatEpisode,
  getDisplayTitle,
  getGenreDisplayName,
  getOriginalTitle,
  getRatingLabel,
} from '@/lib/plans/anime-utils';
import { cx } from '@/utils/cx';

interface ReleaseCardProps {
  item: CalendarItem;
  plan?: Plan;
  isWatching: boolean;
  compact?: boolean;
  onAddToWatching: (item: CalendarItem) => void;
  onRemoveFromWatching: (planId: string) => void;
}

function mediaTypeLabel(mediaType: CalendarItem['mediaType'], t: (key: string) => string) {
  switch (mediaType) {
    case 'anime':
      return t('plans.sourceAnime');
    case 'tv':
      return t('plans.sourceTv');
    case 'movie':
      return t('plans.sourceMovie');
    default:
      return mediaType;
  }
}

const mediaAccent: Record<CalendarItem['mediaType'], string> = {
  anime: 'from-brand-500/80 via-brand-400/40 to-transparent',
  tv: 'from-sky-500/80 via-sky-400/40 to-transparent',
  movie: 'from-amber-500/80 via-amber-400/40 to-transparent',
};

export function ReleaseCard({
  item,
  plan,
  isWatching,
  compact = false,
  onAddToWatching,
  onRemoveFromWatching,
}: ReleaseCardProps) {
  const { t, language } = useTranslation();
  const displayTitle = getDisplayTitle(item, language);
  const originalTitle = getOriginalTitle(item, language);
  const episodeLabel = formatEpisode(item.episode, language);
  const ratingLabel = getRatingLabel(item);
  const genreTags = (item.genres ?? [])
    .map((g) => ({ ...g, displayName: getGenreDisplayName(g, language) }))
    .filter((g) => g.displayName !== null)
    .slice(0, 3) as Array<NonNullable<typeof item.genres>[number] & { displayName: string }>;

  if (compact) {
    return (
      <motion.article
        className={cx('group glass-card flex h-full flex-col overflow-hidden', sliderCardClassName)}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <Link to={`/plans/watching/title/${item.id}`} className="flex h-full flex-col">
          <div className="relative overflow-hidden">
          <div
            className={cx(
              'absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r',
              mediaAccent[item.mediaType],
            )}
          />
          {item.posterUrl ? (
            <LazyImage src={item.posterUrl} alt={displayTitle} aspectRatio="aspect-[2/3]" />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center bg-tertiary text-3xl">
              🎬
            </div>
          )}
          <div className="absolute inset-x-0 top-2 flex items-start justify-between gap-1 p-2">
            <Badge color="gray" size="sm" className="max-w-[5rem] truncate bg-primary/90 backdrop-blur-sm">
              {mediaTypeLabel(item.mediaType, t)}
            </Badge>
            {ratingLabel && (
              <Badge color="brand" size="sm" className="shrink-0 bg-primary/90 backdrop-blur-sm">
                {ratingLabel}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex min-h-[4.5rem] flex-1 flex-col gap-1 p-2.5">
          <p className="line-clamp-2 text-xs font-semibold text-primary">{displayTitle}</p>
          {originalTitle && (
            <p className="truncate text-[11px] text-quaternary">
              {t('plans.originalTitle')}: {originalTitle}
            </p>
          )}
        </CardContent>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="group touch-ripple glass-card h-full overflow-hidden"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className="flex h-full min-w-0 flex-col">
        <Link to={`/plans/watching/title/${item.id}`} className="block">
          <div className="relative overflow-hidden">
          <div
            className={cx(
              'absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r',
              mediaAccent[item.mediaType],
            )}
          />
          {item.posterUrl ? (
            <LazyImage src={item.posterUrl} alt={displayTitle} aspectRatio="aspect-[2/3]" />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center bg-tertiary text-4xl">
              🎬
            </div>
          )}
          <div className="absolute inset-x-0 top-2 flex items-start justify-between gap-2 p-2">
            <Badge color="gray" size="sm" className="bg-primary/90 backdrop-blur-sm">
              {mediaTypeLabel(item.mediaType, t)}
            </Badge>
            {ratingLabel && (
              <Badge color="brand" size="sm" className="bg-primary/90 backdrop-blur-sm">
                {ratingLabel}
              </Badge>
            )}
          </div>
        </div>
        </Link>

        <CardContent className="flex min-h-[9.5rem] min-w-0 flex-1 flex-col gap-3 p-3">
          <Link to={`/plans/watching/title/${item.id}`} className="min-w-0 flex-1 overflow-hidden">
            <p className="line-clamp-2 break-words text-sm font-semibold text-primary hover:text-brand-secondary">
              {displayTitle}
            </p>
            {originalTitle && (
              <p className="mt-0.5 truncate text-xs text-quaternary">
                {t('plans.originalTitle')}: {originalTitle}
              </p>
            )}
            {genreTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 overflow-hidden">
                {genreTags.slice(0, 2).map((genre) => (
                  <Badge key={genre.id ?? genre.name} color="gray" size="sm" className="max-w-[80px] truncate">
                    {genre.displayName}
                  </Badge>
                ))}
                {genreTags.length > 2 && (
                  <Badge color="gray" size="sm">
                    +{genreTags.length - 2}
                  </Badge>
                )}
              </div>
            )}
            <div className="mt-2 flex min-w-0 flex-col gap-1 text-xs text-tertiary">
              <span className="flex min-w-0 items-center gap-1">
                <Calendar className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {formatAirDate(item.airDate, language)} · {formatAirTime(item.airDate, language)}
                </span>
              </span>
              {episodeLabel && <span className="truncate">{episodeLabel}</span>}
            </div>
          </Link>

          <div className="mt-auto flex flex-col gap-2 md:opacity-100 md:group-hover:opacity-100">
            {isWatching ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={plan?.status === 'watched' ? 'success' : 'gray'} size="sm">
                  {plan?.status === 'watched'
                    ? t('plans.statusWatched')
                    : t('plans.inWatching')}
                </Badge>
                <Button
                  size="xs"
                  color="tertiary"
                  iconLeading={EyeOff}
                  onClick={() => plan && onRemoveFromWatching(plan.id)}
                >
                  {t('plans.unwatch')}
                </Button>
              </div>
            ) : (
              <Button
                size="xs"
                color="primary"
                iconLeading={Eye}
                onClick={() => onAddToWatching(item)}
              >
                {t('plans.addToWatching')}
              </Button>
            )}
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-xs font-medium text-brand-secondary hover:underline"
              >
                {t('plans.viewOnSimkl')}
              </a>
            )}
          </div>
        </CardContent>
      </div>
    </motion.article>
  );
}
