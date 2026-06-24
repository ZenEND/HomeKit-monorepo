import { Calendar } from '@untitledui/icons';
import type { Plan, PlanActivityType } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { CardContent } from '@/components/base/card/card';
import { LazyImage } from '@/components/shared/lazy-image';
import { sliderCardClassName } from '@/components/shared/horizontal-slider';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatAirDate, formatAirTime, getDisplayTitle } from '@/lib/plans/anime-utils';
import { cx } from '@/utils/cx';

const activityBadgeColor: Record<PlanActivityType, 'brand' | 'gray' | 'success' | 'warning'> = {
  watching: 'brand',
  racing: 'warning',
  cooking: 'success',
  party: 'brand',
  boardgame: 'gray',
  partygame: 'gray',
};

const activityLabelKeys: Record<PlanActivityType, string> = {
  watching: 'plans.nav.watching',
  racing: 'plans.nav.racing',
  cooking: 'plans.nav.cooking',
  party: 'plans.nav.parties',
  boardgame: 'plans.nav.boardGames',
  partygame: 'plans.nav.partyGames',
};

interface PlanCompactCardProps {
  plan: Plan;
  className?: string;
}

export function PlanCompactCard({ plan, className }: PlanCompactCardProps) {
  const { t, language } = useTranslation();
  const displayTitle = getDisplayTitle(plan, language);
  const activityLabelKey = activityLabelKeys[plan.activityType];

  return (
    <article className={cx('glass-card flex h-full flex-col overflow-hidden', sliderCardClassName, className)}>
      <div className="relative overflow-hidden">
        {plan.posterUrl ? (
          <LazyImage src={plan.posterUrl} alt={displayTitle} aspectRatio="aspect-[2/3]" />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center bg-brand-primary/30 text-3xl">
            {plan.activityType === 'cooking' ? '🍳' : plan.activityType === 'racing' ? '🏎️' : plan.activityType === 'party' ? '🎉' : plan.activityType === 'boardgame' ? '🎲' : plan.activityType === 'partygame' ? '🎮' : '📋'}
          </div>
        )}
        <div className="absolute inset-x-0 top-2 flex items-start justify-between gap-1 p-2">
          <Badge color={activityBadgeColor[plan.activityType]} size="sm" className="max-w-[5.5rem] truncate bg-primary/90 backdrop-blur-sm">
            {t(activityLabelKey)}
          </Badge>
          <Badge
            color={plan.status === 'watched' ? 'success' : plan.status === 'dropped' ? 'error' : 'gray'}
            size="sm"
            className="shrink-0 bg-primary/90 backdrop-blur-sm"
          >
            {plan.status === 'watched'
              ? t('plans.statusWatched')
              : plan.status === 'dropped'
                ? t('plans.statusDropped')
                : t('plans.statusPlanned')}
          </Badge>
        </div>
      </div>

      <CardContent className="flex min-h-[4.5rem] flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 text-xs font-semibold text-primary">{displayTitle}</p>
        {plan.plannedDate && (
          <span className="flex min-w-0 items-center gap-1 text-[11px] text-tertiary">
            <Calendar className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {formatAirDate(plan.plannedDate, language)} · {formatAirTime(plan.plannedDate, language)}
            </span>
          </span>
        )}
      </CardContent>
    </article>
  );
}
