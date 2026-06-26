import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MergedTitleRatings, SimklMediaType } from '@/api/plans';
import { ArrowLeft, ArrowUpRight, Calendar, ChevronDown } from '@untitledui/icons';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { CardContent } from '@/components/base/card/card';
import { LazyImage } from '@/components/shared/lazy-image';
import { SkeletonText } from '@/components/shared/skeleton';
import { TitleHeroCanvas } from '@/components/webgl/TitleHeroCanvas';
import {
  COMPARISON_FIELDS,
  SOURCE_LABEL_KEYS,
  formatFieldValue,
  useTitleDetail,
} from '@/features/plans/hooks/use-title-detail';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  formatAirDate,
  formatAirTime,
  formatEpisode,
  getDisplayTitle,
  getOriginalTitle,
} from '@/lib/plans/anime-utils';
import { cx } from '@/utils/cx';

const mediaAccent: Record<SimklMediaType, string> = {
  anime: 'from-brand-500/90 via-brand-400/50 to-transparent',
  tv: 'from-sky-500/90 via-sky-400/50 to-transparent',
  movie: 'from-amber-500/90 via-amber-400/50 to-transparent',
};

interface PlatformConfig {
  displayName: string;
  color: string;
  secondaryColor?: string;
}

const PLATFORM_CONFIGS: Array<{
  match: (label: string) => boolean;
  config: PlatformConfig;
}> = [
  {
    match: (label) => label.toLowerCase().includes('simkl'),
    config: { displayName: 'Simkl', color: '#C4101B' },
  },
  {
    match: (label) =>
      label.toLowerCase().includes('mal') || label.toLowerCase().includes('myanimelist'),
    config: { displayName: 'MyAnimeList', color: '#2E51A2' },
  },
  {
    match: (label) => label.toLowerCase().includes('shikimori'),
    config: { displayName: 'Shikimori', color: '#7C3AED' },
  },
  {
    match: (label) => label.toLowerCase().includes('anihub'),
    config: { displayName: 'AniHub', color: '#005BBB', secondaryColor: '#FFD700' },
  },
  {
    match: (label) =>
      label.toLowerCase().includes('yani') || label.toLowerCase().includes('yummy'),
    config: { displayName: 'YummyAnime', color: '#F59E0B' },
  },
];

function getPlatformConfig(label: string): PlatformConfig {
  const found = PLATFORM_CONFIGS.find((entry) => entry.match(label));
  return found?.config ?? { displayName: label, color: '#7C3AED' };
}

function mediaTypeLabel(mediaType: SimklMediaType, t: (key: string) => string) {
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

function statusColor(status: string): 'success' | 'error' | 'gray' | 'warning' {
  switch (status) {
    case 'ok':
      return 'success';
    case 'not_found':
      return 'warning';
    case 'skipped':
      return 'gray';
    default:
      return 'error';
  }
}

function formatRatingValue(value: number, max: number): string {
  if (max <= 10) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return value.toFixed(1);
}

function getRatingEntries(ratings: MergedTitleRatings) {
  const entries: Array<{ key: string; label: string; value: number; max: number }> = [];

  if (ratings.mal) entries.push({ key: 'mal', label: 'MAL', value: ratings.mal, max: 10 });
  if (ratings.shikimori) {
    entries.push({ key: 'shikimori', label: 'Shikimori', value: ratings.shikimori, max: 10 });
  }
  if (ratings.simkl) entries.push({ key: 'simkl', label: 'Simkl', value: ratings.simkl, max: 10 });
  if (ratings.yani) entries.push({ key: 'yani', label: 'Yani', value: ratings.yani, max: 10 });
  if (ratings.imdb) entries.push({ key: 'imdb', label: 'IMDb', value: ratings.imdb, max: 10 });

  return entries;
}

function RatingRing({
  label,
  value,
  max,
  delay,
}: {
  label: string;
  value: number;
  max: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="relative size-[72px]">
        <svg className="size-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-secondary/30"
          />
          <motion.circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-brand-secondary"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            transition={{ delay: delay + 0.1, duration: 0.9, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary">
          {formatRatingValue(value, max)}
        </span>
      </div>
      <span className="text-xs font-medium text-tertiary">{label}</span>
    </motion.div>
  );
}

function PlatformCard({
  label,
  url,
  index,
}: {
  label: string;
  url: string;
  index: number;
}) {
  const config = getPlatformConfig(label);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-xl border border-secondary/50 bg-primary/40 p-4 backdrop-blur-sm transition-colors hover:border-secondary"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, type: 'spring', stiffness: 360, damping: 28 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderColor: `${config.color}33`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: config.secondaryColor
            ? `radial-gradient(circle at 30% 20%, ${config.secondaryColor}22, transparent 55%), radial-gradient(circle at 80% 80%, ${config.color}28, transparent 60%)`
            : `radial-gradient(circle at 50% 0%, ${config.color}30, transparent 65%)`,
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: config.color }}
          >
            {config.displayName.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">{config.displayName}</p>
            <p className="text-xs text-tertiary">{label}</p>
          </div>
        </div>
        <ArrowUpRight className="size-4 text-quaternary transition-colors group-hover:text-brand-secondary" />
      </div>
    </motion.a>
  );
}

function TitleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonText className="h-8 w-20" />
      <div className="glass-card overflow-hidden">
        <div className="relative min-h-[320px] p-6">
          <div className="skeleton-shimmer absolute inset-0 bg-tertiary/60" />
          <div className="relative grid gap-6 lg:grid-cols-[180px_1fr]">
            <div className="skeleton-shimmer mx-auto aspect-[2/3] w-full max-w-[180px] rounded-xl bg-tertiary" />
            <div className="flex flex-col gap-4 pt-2">
              <SkeletonText className="h-5 w-24" />
              <SkeletonText className="h-10 w-4/5" />
              <SkeletonText className="h-4 w-3/5" />
              <div className="flex gap-2">
                <SkeletonText className="h-6 w-16 rounded-full" />
                <SkeletonText className="h-6 w-20 rounded-full" />
                <SkeletonText className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card flex justify-center gap-6 p-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer size-[72px] rounded-full bg-tertiary" />
        ))}
      </div>
    </div>
  );
}

export function TitleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { data, isLoading, error } = useTitleDetail(id);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const descriptionInView = useInView(descriptionRef, { once: true, margin: '-80px' });

  if (isLoading) {
    return <TitleDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-sm text-tertiary">{error ?? t('titleDetail.notFound')}</p>
        <Button
          className="mt-4"
          color="secondary"
          size="sm"
          iconLeading={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          {t('titleDetail.back')}
        </Button>
      </div>
    );
  }

  const { item, merged, sources } = data;
  const displayTitle = getDisplayTitle(
    {
      title: merged.title,
      titleEn: merged.titleEn,
      titleUa: merged.titleUa,
    },
    language,
  );
  const originalTitle = getOriginalTitle(
    {
      title: merged.titleOriginal ?? item.title,
      titleEn: merged.titleEn,
      titleUa: merged.titleUa,
    },
    language,
  );
  const episodeLabel = formatEpisode(item.episode, language);
  const comparisonFields = COMPARISON_FIELDS.filter((field) =>
    sources.some((snapshot) => field.key in snapshot.fields),
  );
  const ratingEntries = getRatingEntries(merged.ratings);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <Button
        color="link-gray"
        size="sm"
        iconLeading={ArrowLeft}
        className="w-fit"
        onClick={() => navigate(-1)}
      >
        {t('titleDetail.back')}
      </Button>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden"
      >
        <div
          className={cx(
            'absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r',
            mediaAccent[item.mediaType],
          )}
        />

        <div className="relative min-h-[300px] sm:min-h-[340px]">
          {merged.posterUrl && (
            <img
              src={merged.posterUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/40" />

          <TitleHeroCanvas
            mediaType={item.mediaType}
            className="pointer-events-none absolute inset-0 z-[1]"
          />

          <div className="relative z-10 grid gap-6 p-5 sm:p-6 lg:grid-cols-[200px_1fr] lg:items-end">
            <motion.div
              className="mx-auto w-full max-w-[200px] lg:mx-0"
              initial={{ opacity: 0, y: 20, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              {merged.posterUrl ? (
                <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
                  <LazyImage src={merged.posterUrl} alt={displayTitle} aspectRatio="aspect-[2/3]" />
                </div>
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-tertiary/80 text-5xl shadow-2xl ring-1 ring-white/10">
                  🎬
                </div>
              )}
            </motion.div>

            <div className="flex min-w-0 flex-col gap-3 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="gray" size="sm">
                  {mediaTypeLabel(item.mediaType, t)}
                </Badge>
                {merged.hasUkrainianDub && (
                  <Badge color="success" size="sm">
                    {t('titleDetail.uaDub')}
                  </Badge>
                )}
              </div>

              <h1 className="text-display-xs font-semibold tracking-tight text-primary sm:text-display-sm">
                {displayTitle}
              </h1>

              {originalTitle && (
                <p className="text-sm text-quaternary">
                  {t('plans.originalTitle')}: {originalTitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatAirDate(item.airDate, language)} · {formatAirTime(item.airDate, language)}
                </span>
                {episodeLabel && <span>{episodeLabel}</span>}
                {merged.year && <span>{merged.year}</span>}
                {merged.status && <span className="capitalize">{merged.status}</span>}
                {merged.episodes && (
                  <span>
                    {merged.episodes} {t('titleDetail.field.episodes').toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      {ratingEntries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-card p-5 sm:p-6"
        >
          <h2 className="mb-4 text-sm font-semibold text-primary">{t('titleDetail.ratings')}</h2>
          <div className="flex flex-wrap justify-center gap-6 sm:justify-start sm:gap-8">
            {ratingEntries.map((entry, index) => (
              <RatingRing
                key={entry.key}
                label={entry.label}
                value={entry.value}
                max={entry.max}
                delay={index * 0.06}
              />
            ))}
          </div>
        </motion.section>
      )}

      {merged.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {merged.genres.map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.12 + index * 0.04,
                type: 'spring',
                stiffness: 400,
                damping: 22,
              }}
            >
              <Badge color="gray" size="sm" className="backdrop-blur-sm">
                {genre}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      <motion.section
        ref={descriptionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={descriptionInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-card p-5 sm:p-6"
      >
        <h2 className="mb-3 text-sm font-semibold text-primary">{t('titleDetail.description')}</h2>
        {merged.description ? (
          <>
            <p
              className={cx(
                'text-sm leading-relaxed text-secondary',
                !descExpanded && 'line-clamp-5',
              )}
            >
              {merged.description}
            </p>
            {merged.description.length > 300 && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-secondary hover:underline"
              >
                {descExpanded ? t('titleDetail.showLess') : t('titleDetail.showMore')}
                <ChevronDown
                  className={cx('size-4 transition-transform', descExpanded && 'rotate-180')}
                />
              </button>
            )}
          </>
        ) : (
          <p className="text-sm italic text-tertiary">{t('titleDetail.noDescription')}</p>
        )}
      </motion.section>

      {merged.externalLinks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 sm:p-6"
        >
          <h2 className="text-sm font-semibold text-primary">{t('titleDetail.findOn')}</h2>
          <p className="mt-1 text-xs text-tertiary">{t('titleDetail.findOnHint')}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {merged.externalLinks.map((link, index) => (
              <PlatformCard key={link.url} label={link.label} url={link.url} index={index} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-primary">{t('titleDetail.sourcesTitle')}</h2>
          <p className="mt-1 text-xs text-tertiary">{t('titleDetail.sourcesHint')}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {sources.map((snapshot) => (
              <Badge key={snapshot.source} color={statusColor(snapshot.status)} size="sm">
                {t(SOURCE_LABEL_KEYS[snapshot.source])} ·{' '}
                {t(`titleDetail.status.${snapshot.status}`)}
              </Badge>
            ))}
          </div>

          {comparisonFields.length > 0 && (
            <button
              type="button"
              onClick={() => setSourcesExpanded((open) => !open)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-secondary hover:underline"
            >
              {sourcesExpanded ? t('titleDetail.sourcesExpanded') : t('titleDetail.sourcesCollapsed')}
              <ChevronDown
                className={cx('size-4 transition-transform', sourcesExpanded && 'rotate-180')}
              />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {sourcesExpanded && comparisonFields.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-secondary/60"
            >
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-secondary/60 bg-primary/30">
                        <th className="px-4 py-3 font-semibold text-tertiary">
                          {t('titleDetail.fieldLabel')}
                        </th>
                        {sources.map((snapshot) => (
                          <th
                            key={snapshot.source}
                            className="px-4 py-3 font-semibold text-tertiary"
                          >
                            {t(SOURCE_LABEL_KEYS[snapshot.source])}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFields.map((field) => (
                        <tr key={field.key} className="border-b border-secondary/40">
                          <td className="px-4 py-3 font-medium text-secondary">
                            {t(field.labelKey)}
                          </td>
                          {sources.map((snapshot) => {
                            const rawValue = snapshot.fields[field.key]?.value;
                            const formatted = field.format
                              ? field.format(rawValue)
                              : formatFieldValue(rawValue);

                            return (
                              <td
                                key={`${snapshot.source}-${field.key}`}
                                className={cx(
                                  'max-w-[220px] px-4 py-3 text-tertiary',
                                  formatted === '—' && 'text-quaternary',
                                )}
                              >
                                {formatted}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <div className="flex justify-end">
        <Link
          to="/plans/watching/current"
          className="inline-flex items-center rounded-lg border border-secondary/60 px-3 py-2 text-sm font-medium text-secondary hover:bg-primary_hover"
        >
          {t('titleDetail.backToReleases')}
        </Link>
      </div>
    </div>
  );
}
