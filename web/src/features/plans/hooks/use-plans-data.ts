import { useCallback, useEffect, useState } from 'react';
import {
  getCalendar,
  getUserPlans,
  refreshCalendar,
  type CalendarItem,
  type CalendarQueryParams,
  type Plan,
  type PlansQueryParams,
  type SimklMediaTypeFilter,
} from '@/api/plans';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';
import { getApiErrorMessage } from '../utils/api-error';

interface UseCalendarDataOptions {
  dateRange: { from?: string; to?: string };
  sourceFilter?: SimklMediaTypeFilter;
  enabled?: boolean;
}

export function useCalendarData({
  dateRange,
  sourceFilter = 'anime',
  enabled = true,
}: UseCalendarDataOptions) {
  const { t } = useTranslation();
  const showError = useTooltipStore((state) => state.showError);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCalendar = useCallback(async () => {
    if (!enabled) return;

    const params: CalendarQueryParams = {
      ...dateRange,
      source: sourceFilter,
    };

    try {
      const calendar = await getCalendar(params);
      setItems(calendar.items);
      setLastSyncedAt(calendar.lastSyncedAt);
    } catch {
      showError(t('plans.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, enabled, showError, sourceFilter, t]);

  useEffect(() => {
    setIsLoading(true);
    void loadCalendar();
  }, [loadCalendar]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshCalendar({ source: sourceFilter });
      // If some sources failed but others succeeded, show a warning rather than blocking.
      if (result.sourceErrors && Object.keys(result.sourceErrors).length > 0) {
        const failed = Object.keys(result.sourceErrors).join(', ');
        showError(t('plans.refreshPartialError', { sources: failed }));
      }
      await loadCalendar();
    } catch (err: unknown) {
      showError(getApiErrorMessage(err, t('plans.refreshError')));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadCalendar, showError, sourceFilter, t]);

  return {
    items,
    lastSyncedAt,
    isLoading,
    isRefreshing,
    reload: loadCalendar,
    refresh: handleRefresh,
  };
}

const EMPTY_PLANS_QUERY: PlansQueryParams = {};
interface UseSavedPlansOptions {
  query?: PlansQueryParams;
  enabled?: boolean;
}

export function useSavedPlans({ query = EMPTY_PLANS_QUERY, enabled = true }: UseSavedPlansOptions = {}) {
  const { t } = useTranslation();
  const showError = useTooltipStore((state) => state.showError);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    if (!enabled) return;

    try {
      const data = await getUserPlans(query);
      setPlans(data);
    } catch {
      showError(t('plans.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, query, showError, t]);

  useEffect(() => {
    setIsLoading(true);
    void loadPlans();
  }, [loadPlans]);

  return {
    plans,
    setPlans,
    isLoading,
    reload: loadPlans,
  };
}
