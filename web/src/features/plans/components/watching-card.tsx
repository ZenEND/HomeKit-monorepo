import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Calendar, CheckCircle, Clock, EyeOff, RefreshCcw01 } from '@untitledui/icons';
import type { Plan } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { CardContent } from '@/components/base/card/card';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { LazyImage } from '@/components/shared/lazy-image';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  formatAirDate,
  formatAirTime,
  formatEpisode,
  getDisplayTitle,
  getOriginalTitle,
} from '@/lib/plans/anime-utils';
import { cx } from '@/utils/cx';

interface WatchingCardProps {
  plan: Plan;
  isUpdating: boolean;
  isDeleting: boolean;
  onMarkWatched: (planId: string) => void;
  onMarkUnwatched: (planId: string) => void;
  onRemove: (planId: string) => void;
}

function formatRelativeTime(dateIso: string, locale: string): string {
  const date = new Date(dateIso);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const divisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  let duration = diffSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(duration, division.unit);
    }
    duration = Math.round(duration / division.amount);
  }

  return rtf.format(0, 'second');
}

function getPlanProgress(plan: Plan): { percent: number; color: string; glow: string } {
  const metadata = plan.metadata;
  const totalEpisodes =
    typeof metadata?.totalEpisodes === 'number' ? metadata.totalEpisodes : null;
  const episodesWatched =
    typeof metadata?.episodesWatched === 'number'
      ? metadata.episodesWatched
      : plan.episode?.episode ?? null;

  if (plan.status === 'watched') {
    return {
      percent: 100,
      color: 'bg-green-500',
      glow: '0 0 6px rgba(34,197,94,0.6)',
    };
  }

  if (plan.status === 'dropped') {
    const percent =
      totalEpisodes && episodesWatched
        ? Math.min(100, (episodesWatched / totalEpisodes) * 100)
        : 40;
    return {
      percent,
      color: 'bg-red-500',
      glow: '0 0 6px rgba(239,68,68,0.55)',
    };
  }

  const percent =
    totalEpisodes && episodesWatched
      ? Math.min(100, (episodesWatched / totalEpisodes) * 100)
      : 0;

  return {
    percent,
    color: 'bg-brand-solid',
    glow: '0 0 6px rgba(127,86,217,0.45)',
  };
}

function PosterBlock({
  plan,
  displayTitle,
  isWatched,
  isDropped,
  prefersReducedMotion,
  statusLabel,
}: {
  plan: Plan;
  displayTitle: string;
  isWatched: boolean;
  isDropped: boolean;
  prefersReducedMotion: boolean | null;
  statusLabel: string;
}) {
  const posterContent = (
    <>
      {plan.posterUrl ? (
        <LazyImage
          src={plan.posterUrl}
          alt={displayTitle}
          aspectRatio="aspect-[2/3]"
          className={cx(
            isWatched && 'saturate-[0.7]',
            isDropped && 'grayscale-[0.4]',
          )}
        />
      ) : (
        <div className="flex aspect-[2/3] items-center justify-center bg-tertiary text-4xl">
          📋
        </div>
      )}

      {isWatched && (
        <div
          className="pointer-events-none absolute inset-0 bg-green-500/15"
          aria-hidden="true"
        />
      )}
      {isDropped && (
        <div
          className="pointer-events-none absolute inset-0 bg-red-500/12"
          aria-hidden="true"
        />
      )}

      {!prefersReducedMotion && (
        <div
          className="card-shimmer-streak pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-x-0 top-0 p-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={plan.status}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : [0.85, 1.05, 1] }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25 }}
          >
            <Badge
              color={isWatched ? 'success' : isDropped ? 'error' : 'gray'}
              size="sm"
              className="bg-primary/90 backdrop-blur-sm"
            >
              {statusLabel}
            </Badge>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );

  return (
    <div className="relative overflow-hidden">
      {posterContent}
    </div>
  );
}

export function WatchingCard({
  plan,
  isUpdating,
  isDeleting,
  onMarkWatched,
  onMarkUnwatched,
  onRemove,
}: WatchingCardProps) {
  const { t, language } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const displayTitle = getDisplayTitle(plan, language);
  const originalTitle = getOriginalTitle(plan, language);
  const episodeLabel = formatEpisode(plan.episode, language);
  const isWatched = plan.status === 'watched';
  const isDropped = plan.status === 'dropped';
  const progress = getPlanProgress(plan);
  const updatedLabel = formatRelativeTime(plan.updatedAt ?? plan.createdAt, language);

  const statusLabel = isWatched
    ? t('plans.statusWatched')
    : isDropped
      ? t('plans.statusDropped')
      : t('plans.statusPlanned');

  return (
    <motion.article
      className="group touch-ripple glass-card h-full overflow-hidden"
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      layout={!prefersReducedMotion}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className="flex h-full flex-col">
        {plan.calendarItemId ? (
          <Link to={`/plans/watching/title/${plan.calendarItemId}`} className="block">
            <PosterBlock
              plan={plan}
              displayTitle={displayTitle}
              isWatched={isWatched}
              isDropped={isDropped}
              prefersReducedMotion={prefersReducedMotion}
              statusLabel={statusLabel}
            />
          </Link>
        ) : (
          <PosterBlock
            plan={plan}
            displayTitle={displayTitle}
            isWatched={isWatched}
            isDropped={isDropped}
            prefersReducedMotion={prefersReducedMotion}
            statusLabel={statusLabel}
          />
        )}

        <div className="h-[3px] bg-secondary/80">
          <div
            className={cx('h-full rounded-full transition-all duration-300', progress.color)}
            style={{ width: `${progress.percent}%`, boxShadow: progress.glow }}
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('plans.filterStatus')}
          />
        </div>

        <CardContent className="flex min-h-[9.5rem] min-w-0 flex-1 flex-col gap-3 p-3">
          <div className="min-w-0 flex-1">
            {plan.calendarItemId ? (
              <Link
                to={`/plans/watching/title/${plan.calendarItemId}`}
                className="line-clamp-2 text-sm font-semibold text-primary hover:text-brand-secondary"
              >
                {displayTitle}
              </Link>
            ) : (
              <p className="line-clamp-2 text-sm font-semibold text-primary">{displayTitle}</p>
            )}
            {originalTitle && (
              <p className="mt-0.5 line-clamp-1 text-xs text-quaternary">
                {t('plans.originalTitle')}: {originalTitle}
              </p>
            )}
            <div className="mt-2 flex flex-col gap-1 text-xs text-tertiary">
              {plan.plannedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {formatAirDate(plan.plannedDate, language)} ·{' '}
                    {formatAirTime(plan.plannedDate, language)}
                  </span>
                </span>
              )}
              {episodeLabel && <span className="truncate">{episodeLabel}</span>}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {isWatched ? (
                <Tooltip title={t('plans.markUnwatched')}>
                  <Button
                    size="xs"
                    color="secondary"
                    iconLeading={RefreshCcw01}
                    isLoading={isUpdating}
                    aria-label={t('plans.markUnwatched')}
                    onClick={() => onMarkUnwatched(plan.id)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title={t('plans.markWatched')}>
                  <Button
                    size="xs"
                    color="primary"
                    iconLeading={CheckCircle}
                    isLoading={isUpdating}
                    aria-label={t('plans.markWatched')}
                    aria-pressed={false}
                    onClick={() => onMarkWatched(plan.id)}
                  />
                </Tooltip>
              )}
              <Tooltip title={t('plans.unwatch')}>
                <Button
                  size="xs"
                  color="tertiary"
                  iconLeading={EyeOff}
                  isLoading={isDeleting}
                  aria-label={t('plans.unwatch')}
                  onClick={() => onRemove(plan.id)}
                />
              </Tooltip>
            </div>

            <span className="flex items-center gap-1 text-[11px] text-quaternary">
              <Clock className="size-3 shrink-0" aria-hidden="true" />
              {updatedLabel}
            </span>

            {plan.sourceUrl && (
              <a
                href={plan.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-brand-secondary hover:underline"
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

function TvEmptyIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-brand-secondary"
    >
      <rect x="8" y="18" width="64" height="42" rx="6" fill="currentColor" opacity="0.12" />
      <rect x="12" y="22" width="56" height="34" rx="4" fill="currentColor" opacity="0.18" />
      <rect x="30" y="62" width="20" height="4" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="24" y="66" width="32" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
      <clipPath id="tv-screen-clip">
        <rect x="14" y="24" width="52" height="30" rx="3" />
      </clipPath>
      <g clipPath="url(#tv-screen-clip)">
        <rect
          x="14"
          y="24"
          width="52"
          height="30"
          rx="3"
          fill="currentColor"
          opacity="0.08"
        />
        <rect
          className="tv-scan-lines"
          x="14"
          y="24"
          width="52"
          height="8"
          fill="url(#scan-gradient)"
          opacity="0.35"
        />
      </g>
      <defs>
        <linearGradient id="scan-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface WatchingEmptyStateProps {
  className?: string;
}

export function WatchingEmptyState({ className }: WatchingEmptyStateProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cx('glass-card', className)}
    >
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
          }
        >
          <TvEmptyIllustration />
        </motion.div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-tertiary">{t('plans.noSavedPlans')}</p>
          <p className="text-xs text-quaternary">{t('plans.emptyWatchingSubtitle')}</p>
        </div>
        <motion.div
          initial={{ scale: 1 }}
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.04, 1] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { delay: 0.5, duration: 0.6, ease: 'easeOut' }
          }
        >
          <Button color="primary" size="sm" onClick={() => navigate('/plans/watching/current')}>
            {t('plans.emptyWatchingCta')}
          </Button>
        </motion.div>
      </CardContent>
    </motion.div>
  );
}
