import { useCallback, useEffect, useState } from 'react';
import {
  getRecommendations,
  type PlanActivityType,
  type RecommendationsResponse,
} from '@/api/plans';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';

export function useRecommendations(activity: PlanActivityType, enabled = true) {
  const { t } = useTranslation();
  const showError = useTooltipStore((state) => state.showError);
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await getRecommendations(activity);
      setData(response);
    } catch {
      showError(t('plans.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [activity, enabled, showError, t]);

  useEffect(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return { data, isLoading, reload: load };
}
