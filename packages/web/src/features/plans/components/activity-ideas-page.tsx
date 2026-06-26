import type { PlanActivityType } from '@/api/plans';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { ActivityIdea } from '@/lib/plans/activity-ideas';
import { useActivityPlanActions } from '../hooks/use-activity-plan-actions';
import { IdeaSection } from './idea-card';

interface ActivityIdeasPageProps {
  activityType: PlanActivityType;
  titleKey: string;
  subtitleKey: string;
  ideas: ActivityIdea[];
}

export function ActivityIdeasPage({
  activityType,
  titleKey,
  subtitleKey,
  ideas,
}: ActivityIdeasPageProps) {
  const { t } = useTranslation();
  const { savingId, savedIds, saveIdea } = useActivityPlanActions(activityType);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-md font-semibold text-primary">{t(titleKey)}</h2>
        <p className="text-xs text-tertiary">{t(subtitleKey)}</p>
      </div>

      <IdeaSection
        title={t('plans.ideasTitle')}
        items={ideas}
        showSaveAction
        savingId={savingId}
        savedIds={savedIds}
        onSave={(idea) => void saveIdea(idea)}
      />
    </section>
  );
}
