import { Bookmark, BookmarkCheck, BookmarkMinus, Play } from '@untitledui/icons';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { IdeaCard as ApiIdeaCard } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card/card';
import { LazyImage } from '@/components/shared/lazy-image';
import { HorizontalSlider, sliderCardClassName } from '@/components/shared/horizontal-slider';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { ActivityIdea } from '@/lib/plans/activity-ideas';
import { cx } from '@/utils/cx';

function RecommendedTag({ tag }: { tag: 'trending' | 'top-rated' }) {
  if (tag === 'trending') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow backdrop-blur-sm">
        🔥 Trending
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow backdrop-blur-sm">
      ⭐ Top Rated
    </span>
  );
}

function noPosterGradient(tag: 'trending' | 'top-rated' | null | undefined): string {
  if (tag === 'trending') return 'bg-gradient-to-br from-orange-500/30 to-amber-400/20';
  if (tag === 'top-rated') return 'bg-gradient-to-br from-amber-400/30 to-yellow-300/20';
  return 'bg-brand-primary/30';
}

interface IdeaCardProps {
  idea: ActivityIdea | ApiIdeaCard;
  index: number;
  compact?: boolean;
  isSaving?: boolean;
  isSaved?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
  showSaveAction?: boolean;
  /** When set, the compact card poster and title become a link to this path */
  detailHref?: string;
}

function isActivityIdea(idea: ActivityIdea | ApiIdeaCard): idea is ActivityIdea {
  return 'homekitTieIn' in idea && idea.homekitTieIn !== null && idea.howItWorks !== null;
}

function hasPoster(idea: ActivityIdea | ApiIdeaCard): idea is ApiIdeaCard {
  return 'posterUrl' in idea && Boolean(idea.posterUrl);
}

export function IdeaCard({
  idea,
  index,
  compact = false,
  isSaving = false,
  isSaved = false,
  onSave,
  onRemove,
  showSaveAction = false,
  detailHref,
}: IdeaCardProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const hasPosterImage = hasPoster(idea);
  const howItWorks = isActivityIdea(idea) ? idea.howItWorks : idea.howItWorks ?? [];
  const homekitTieIn = isActivityIdea(idea) ? idea.homekitTieIn : idea.homekitTieIn;
  const rank = 'rank' in idea ? idea.rank : null;
  const rating = 'rating' in idea ? idea.rating : null;
  const tag = 'tag' in idea ? idea.tag : null;

  if (compact) {
    const posterContent = (
      <div className="relative overflow-hidden">
        {hasPosterImage ? (
          <>
            <LazyImage src={idea.posterUrl!} alt={idea.title} aspectRatio="aspect-[2/3]" />
            {detailHref && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                aria-hidden="true"
              >
                <Play className="size-8 text-white drop-shadow-lg" />
              </div>
            )}
          </>
        ) : (
          <div className={cx('flex aspect-[2/3] items-center justify-center text-4xl', noPosterGradient(tag))}>
            {idea.emoji}
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {tag ? (
            <RecommendedTag tag={tag} />
          ) : rank != null ? (
            <Badge color="brand" size="sm" className="bg-primary/90 backdrop-blur-sm">
              #{rank}
            </Badge>
          ) : null}
        </div>

        {rating != null && (
          <div className="absolute right-2 top-2">
            <Badge color="gray" size="sm" className="bg-primary/90 backdrop-blur-sm">
              ★ {rating}
            </Badge>
          </div>
        )}
      </div>
    );

    return (
      <motion.article
        className={cx('group glass-card flex h-full flex-col overflow-hidden', sliderCardClassName)}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {detailHref ? (
          <Link to={detailHref} className="block">
            {posterContent}
          </Link>
        ) : (
          posterContent
        )}

        <CardContent className="flex min-h-[4.5rem] flex-1 flex-col gap-1 p-2.5">
          <div className="flex items-start gap-1">
            {!hasPosterImage && <span className="shrink-0 text-base" aria-hidden="true">{idea.emoji}</span>}
            <div className="min-w-0 flex-1">
              {detailHref ? (
                <Link to={detailHref}>
                  <p className="line-clamp-2 text-xs font-semibold text-primary transition-colors hover:text-brand-secondary">
                    {idea.title}
                  </p>
                </Link>
              ) : (
                <p className="line-clamp-2 text-xs font-semibold text-primary">{idea.title}</p>
              )}
              {idea.vibe && <p className="mt-0.5 line-clamp-1 text-[11px] text-tertiary">{idea.vibe}</p>}
            </div>
            {showSaveAction && (onSave || onRemove) && (
              <motion.button
                type="button"
                aria-label={isSaved ? t('plans.removeFromPlans') : t('plans.saveIdea')}
                disabled={isSaving}
                onClick={isSaved ? onRemove : onSave}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="shrink-0 rounded-lg p-1 transition-colors disabled:opacity-40"
              >
                {isSaved ? (
                  <BookmarkMinus className="size-4 text-brand-solid" />
                ) : (
                  <Bookmark className="size-4 text-tertiary hover:text-brand-solid" />
                )}
              </motion.button>
            )}
          </div>
        </CardContent>
      </motion.article>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="touch-ripple glass-card group h-full overflow-hidden"
    >
      {hasPosterImage && (
        <div className="relative overflow-hidden">
          <LazyImage src={idea.posterUrl!} alt={idea.title} aspectRatio="aspect-[2/3]" />
          {rank != null && (
            <div className="absolute left-2 top-2">
              <Badge color="brand" size="sm" className="bg-primary/90 backdrop-blur-sm">
                #{rank}
              </Badge>
            </div>
          )}
          {rating != null && (
            <div className="absolute right-2 top-2">
              <Badge color="gray" size="sm" className="bg-primary/90 backdrop-blur-sm">
                ★ {rating}
              </Badge>
            </div>
          )}
          {tag && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <RecommendedTag tag={tag} />
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <motion.span
              className="text-2xl"
              aria-hidden="true"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {idea.emoji}
            </motion.span>
            <div className="min-w-0">
              <CardTitle className="line-clamp-2 text-base">{idea.title}</CardTitle>
              {idea.vibe && <CardDescription className="mt-1 truncate">{idea.vibe}</CardDescription>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {idea.groupSize && (
              <Badge color="gray" size="sm">
                {idea.groupSize} {t('common.people')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-3 text-sm text-secondary">{idea.summary}</p>

        {howItWorks.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-quaternary">
              {t('parties.howItWorks')}
            </p>
            <ul className="flex flex-col gap-1.5">
              {howItWorks.map((step, stepIndex) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + stepIndex * 0.05 }}
                  className="flex items-start gap-2 text-sm text-secondary"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-solid"
                    aria-hidden="true"
                  />
                  {step}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {homekitTieIn && (
          <div className="rounded-lg bg-brand-primary/50 px-3 py-2 text-xs text-tertiary backdrop-blur-sm">
            <span className="font-medium text-secondary">{t('parties.tieIn')}:</span>{' '}
            {homekitTieIn}
          </div>
        )}

        {showSaveAction && onSave && (
          <Button
            size="sm"
            color={isSaved ? 'secondary' : 'primary'}
            isLoading={isSaving}
            isDisabled={isSaved}
            onClick={onSave}
            className="transition-transform group-hover:scale-[1.02]"
          >
            {isSaved ? t('plans.inYourPlans') : t('plans.saveIdea')}
          </Button>
        )}
      </CardContent>
    </motion.div>
  );
}

interface IdeaSectionProps {
  title: string;
  items: (ActivityIdea | ApiIdeaCard)[];
  showSaveAction?: boolean;
  savingId?: string | null;
  savedIds?: Set<string>;
  onSave?: (idea: ActivityIdea) => void;
  asSlider?: boolean;
}

export function IdeaSection({
  title,
  items,
  showSaveAction = false,
  savingId,
  savedIds,
  onSave,
  asSlider = false,
}: IdeaSectionProps) {
  if (items.length === 0) return null;

  if (asSlider) {
    return (
      <HorizontalSlider title={title}>
        {items.map((idea, index) => (
          <IdeaCard key={idea.id} idea={idea} index={index} compact />
        ))}
      </HorizontalSlider>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            index={index}
            showSaveAction={showSaveAction}
            isSaving={savingId === idea.id}
            isSaved={savedIds?.has(idea.id)}
            onSave={onSave && isActivityIdea(idea) ? () => onSave(idea) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
