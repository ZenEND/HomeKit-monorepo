import { useCallback, useState } from 'react';
import {
  createPlan,
  deletePlan,
  updatePlanStatus,
  type Plan,
  type PlanActivityType,
} from '@/api/plans';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';
import type { ActivityIdea } from '@/lib/plans/activity-ideas';

export function useActivityPlanActions(activityType: PlanActivityType) {
  const { t } = useTranslation();
  const showError = useTooltipStore((state) => state.showError);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const saveIdea = useCallback(
    async (idea: ActivityIdea) => {
      setSavingId(idea.id);
      try {
        const plan = await createPlan({
          activityType,
          title: idea.title,
          metadata: { ideaId: idea.id, emoji: idea.emoji },
        });
        setSavedIds((current) => new Set(current).add(idea.id));
        return plan;
      } catch {
        showError(t('plans.createError'));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [activityType, showError, t],
  );

  const markDone = useCallback(
    async (plan: Plan) => {
      try {
        return await updatePlanStatus(plan.id, 'watched');
      } catch {
        showError(t('plans.updateError'));
        return null;
      }
    },
    [showError, t],
  );

  const removePlan = useCallback(
    async (planId: string) => {
      try {
        await deletePlan(planId);
        return true;
      } catch {
        showError(t('plans.deleteError'));
        return false;
      }
    },
    [showError, t],
  );

  return { savingId, savedIds, saveIdea, markDone, removePlan };
}
