import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  createPlan,
  deletePlan,
  updatePlanStatus,
  type CalendarItem,
  type Plan,
} from '@/api/plans';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';

export function useWatchingActions(setPlans: Dispatch<SetStateAction<Plan[]>>) {
  const { t } = useTranslation();
  const showError = useTooltipStore((state) => state.showError);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addToWatching = useCallback(
    async (item: CalendarItem) => {
      try {
        const plan = await createPlan({ calendarItemId: item.id });
        setPlans((current) => {
          const existing = current.find((entry) => entry.id === plan.id);
          return existing ? current : [...current, plan];
        });
        return plan;
      } catch {
        showError(t('plans.createError'));
        return null;
      }
    },
    [setPlans, showError, t],
  );

  const removeFromWatching = useCallback(
    async (planId: string) => {
      setDeletingId(planId);
      try {
        await deletePlan(planId);
        setPlans((current) => current.filter((plan) => plan.id !== planId));
        return true;
      } catch {
        showError(t('plans.deleteError'));
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [setPlans, showError, t],
  );

  const markWatched = useCallback(
    async (planId: string) => {
      setUpdatingId(planId);
      try {
        const updated = await updatePlanStatus(planId, 'watched');
        setPlans((current) => current.map((plan) => (plan.id === planId ? updated : plan)));
        return updated;
      } catch {
        showError(t('plans.updateError'));
        return null;
      } finally {
        setUpdatingId(null);
      }
    },
    [setPlans, showError, t],
  );

  const markUnwatched = useCallback(
    async (planId: string) => {
      setUpdatingId(planId);
      try {
        const updated = await updatePlanStatus(planId, 'planned');
        setPlans((current) => current.map((plan) => (plan.id === planId ? updated : plan)));
        return updated;
      } catch {
        showError(t('plans.updateError'));
        return null;
      } finally {
        setUpdatingId(null);
      }
    },
    [setPlans, showError, t],
  );

  return {
    updatingId,
    deletingId,
    addToWatching,
    removeFromWatching,
    markWatched,
    markUnwatched,
  };
}
