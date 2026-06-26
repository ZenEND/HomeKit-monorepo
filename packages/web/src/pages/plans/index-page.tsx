import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Star01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { createPlan, type PlanActivityType } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { CardContent } from '@/components/base/card/card';
import { HorizontalSlider } from '@/components/shared/horizontal-slider';
import { ContentLoader } from '@/components/shared/skeleton';
import { IdeaCard } from '@/features/plans/components/idea-card';
import { PlanCompactCard } from '@/features/plans/components/plan-compact-card';
import { useSavedPlans } from '@/features/plans/hooks/use-plans-data';
import { useRecommendations } from '@/features/plans/hooks/use-recommendations';
import { getCalendarWeekRange } from '@/features/plans/utils/release-ranges';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';

const WATCHING_QUERY = { activityType: 'watching' as const };

/** Wider card class used exclusively for the Trending slider */
const trendingCardClassName = 'w-44 shrink-0 snap-start sm:w-48 lg:w-52';

/** Skeleton row rendered while watching recommendations load */
function SliderSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-64 w-40 shrink-0 animate-pulse rounded-2xl bg-secondary sm:w-44 lg:w-48"
        />
      ))}
    </div>
  );
}

export function PlansIndexPage() {
  const { t, language } = useTranslation();
  const showError = useTooltipStore((state) => state.showError);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekRange = useMemo(
    () => getCalendarWeekRange(weekOffset, language),
    [language, weekOffset],
  );

  const plansQuery = useMemo(
    () => ({
      from: weekRange.from,
      to: weekRange.to,
      status: 'planned' as const,
    }),
    [weekRange.from, weekRange.to],
  );

  const { plans, isLoading: isLoadingPlans } = useSavedPlans({ query: plansQuery });
  const { plans: watchingPlans, setPlans: setWatchingPlans } = useSavedPlans({ query: WATCHING_QUERY });

  const saveRecoItem = useCallback(
    async (calendarItemId: string) => {
      try {
        const plan = await createPlan({ calendarItemId });
        setWatchingPlans((prev) => (prev.find((p) => p.id === plan.id) ? prev : [...prev, plan]));
      } catch {
        showError(t('plans.createError'));
      }
    },
    [setWatchingPlans, showError, t],
  );

  const { data: watchingReco, isLoading: isLoadingWatching } = useRecommendations('watching');
  const { data: cookingReco, isLoading: isLoadingCooking } = useRecommendations('cooking');
  const { data: boardgameReco } = useRecommendations('boardgame');
  const { data: partygameReco } = useRecommendations('partygame');

  const trendingSection = watchingReco?.sections.find((section) => section.section === 'trending');
  const watchSections = watchingReco?.sections.filter((section) => section.section !== 'trending') ?? [];

  const playItems = useMemo(() => {
    const boardItems = boardgameReco?.sections.flatMap((section) => section.items) ?? [];
    const partyItems = partygameReco?.sections.flatMap((section) => section.items) ?? [];
    return [...boardItems, ...partyItems];
  }, [boardgameReco, partygameReco]);

  const groupedPlans = useMemo(() => {
    const groups = new Map<PlanActivityType, typeof plans>();
    for (const plan of plans) {
      const existing = groups.get(plan.activityType) ?? [];
      existing.push(plan);
      groups.set(plan.activityType, existing);
    }
    return groups;
  }, [plans]);

  const weekTitle =
    weekOffset === 0 ? t('plans.thisWeek') : t('plans.weekOf', { range: weekRange.label });

  const hasCookOrPlay =
    (!isLoadingCooking && cookingReco && cookingReco.sections.length > 0) || playItems.length > 0;

  return (
    <section className="flex flex-col gap-8">
      {/* ── Heading ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-display-xs font-semibold text-primary">{t('plans.indexTitle')}</h2>
        <p className="text-sm text-tertiary">{t('plans.indexSubtitle')}</p>
      </div>

      {/* ── Week navigator ── */}
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            size="sm"
            color="tertiary"
            iconLeading={ArrowLeft}
            aria-label={t('plans.previousWeek')}
            onClick={() => setWeekOffset((value) => value - 1)}
          />
          <div className="flex min-w-0 items-center gap-2">
            <Calendar className="size-4 shrink-0 text-tertiary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary">{weekTitle}</p>
              <p className="truncate text-xs text-tertiary">{weekRange.label}</p>
            </div>
          </div>
          <Button
            size="sm"
            color="tertiary"
            iconLeading={ArrowRight}
            aria-label={t('plans.nextWeek')}
            onClick={() => setWeekOffset((value) => value + 1)}
          />
        </div>
        {weekOffset !== 0 && (
          <Button size="sm" color="secondary" onClick={() => setWeekOffset(0)}>
            {t('plans.thisWeek')}
          </Button>
        )}
      </div>

      {/* ── My Plans This Week ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-primary">{t('plans.myPlansThisWeek')}</h3>
          <Badge color="gray" size="sm">
            {plans.length}
          </Badge>
        </div>

        {isLoadingPlans ? (
          <ContentLoader />
        ) : plans.length === 0 ? (
          <div className="glass-card">
            <CardContent className="py-8 text-center text-sm text-tertiary">
              {t('plans.noPlansThisWeek')}
            </CardContent>
          </div>
        ) : (
          <HorizontalSlider title={weekRange.label}>
            {plans.map((plan) => (
              <PlanCompactCard key={plan.id} plan={plan} />
            ))}
          </HorizontalSlider>
        )}
      </div>

      <hr className="border-border-secondary" />

      {/* ── Trending This Season ── */}
      {isLoadingWatching ? (
        <div className="flex flex-col gap-3">
          <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
          <SliderSkeleton />
        </div>
      ) : (
        trendingSection && trendingSection.items.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col gap-3"
          >
            <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
            <HorizontalSlider title={`🔥 ${t('plans.trendingThisSeason')}`}>
              {trendingSection.items.map((idea, index) => (
                <div key={idea.id} className={trendingCardClassName}>
                  <IdeaCard
                    idea={idea}
                    index={index}
                    compact
                    showSaveAction
                    isSaved={watchingPlans.some((p) => p.calendarItemId === idea.id)}
                    onSave={() => void saveRecoItem(idea.id)}
                  />
                </div>
              ))}
            </HorizontalSlider>
          </motion.section>
        )
      )}

      {/* ── Top Rated / other watch sections ── */}
      {!isLoadingWatching && watchSections.length > 0 && (
        <>
          <hr className="border-border-secondary" />
          <div className="flex flex-col gap-6">
            {watchSections.map((section) => (
              <div key={section.section} className="flex flex-col gap-3">
                <div className="border-l-2 border-brand-solid pl-3">
                  <HorizontalSlider
                    title={section.title}
                    icon={<Star01 className="size-4" />}
                  >
                    {section.items.map((idea, index) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        index={index}
                        compact
                        showSaveAction
                        isSaved={watchingPlans.some((p) => p.calendarItemId === idea.id)}
                        onSave={() => void saveRecoItem(idea.id)}
                      />
                    ))}
                  </HorizontalSlider>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Cook & Play ── */}
      {hasCookOrPlay && <hr className="border-border-secondary" />}

      {!isLoadingCooking && cookingReco && cookingReco.sections.length > 0 && (
        <HorizontalSlider
          title={t('plans.recommendedToCook')}
          subtitle={t('plans.recommendedToCookHint')}
        >
          {cookingReco.sections.flatMap((section) =>
            section.items.map((idea, index) => (
              <IdeaCard key={idea.id} idea={idea} index={index} compact />
            )),
          )}
        </HorizontalSlider>
      )}

      {playItems.length > 0 && (
        <HorizontalSlider
          title={t('plans.recommendedToPlay')}
          subtitle={t('plans.recommendedToPlayHint')}
        >
          {playItems.map((idea, index) => (
            <IdeaCard key={idea.id} idea={idea} index={index} compact />
          ))}
        </HorizontalSlider>
      )}

      {/* ── Plans by Category ── */}
      {groupedPlans.size > 0 && (
        <>
          <hr className="border-border-secondary" />
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-primary">{t('plans.plansByCategory')}</h3>
            {Array.from(groupedPlans.entries()).map(([activityType, activityPlans]) => {
              const labelKey =
                activityType === 'party'
                  ? 'plans.nav.parties'
                  : activityType === 'boardgame'
                    ? 'plans.nav.boardGames'
                    : activityType === 'partygame'
                      ? 'plans.nav.partyGames'
                      : `plans.nav.${activityType}`;

              return (
                <HorizontalSlider key={activityType} title={t(labelKey)}>
                  {activityPlans.map((plan) => (
                    <PlanCompactCard key={plan.id} plan={plan} />
                  ))}
                </HorizontalSlider>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
