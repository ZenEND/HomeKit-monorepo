import { useEffect, useMemo, useState } from 'react';
import { HelpCircle, RefreshCw05, Shield01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { apiInstance } from '@/api/instance';
import { refreshCalendar, type CalendarRefreshResponse, type EnrichmentSourceId } from '@/api/plans';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Toggle } from '@/components/base/toggle/toggle';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { LoadingSpinner } from '@/components/shared/animated-icon';
import {
  DEFAULT_ENABLED_SOURCE_IDS,
  METADATA_SOURCE_ID_MAP,
  SYNC_SOURCE_CATEGORIES,
  SYNC_SOURCES,
  type SyncSourceCategory,
} from '@/features/admin/sync-sources';
import {
  getEnabledMetadataSourceIds,
  setEnabledMetadataSourceIds,
} from '@/features/admin/enrichment-sources';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTooltipStore } from '@/store/useTooltipStore';
import { useUserStore } from '@/store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { cx } from '@/utils/cx';

interface AiHealthResponse {
  status?: string;
  models?: Record<string, { ok: boolean }>;
}

const CATEGORY_LABEL_KEYS: Record<SyncSourceCategory, string> = {
  anime: 'admin.category.anime',
  tv: 'admin.category.tv',
  movie: 'admin.category.movie',
};

function SourceToggleRow({
  label,
  tooltip,
  docsUrl,
  isSelected,
  isDisabled,
  onChange,
}: {
  label: string;
  tooltip: string;
  docsUrl: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-secondary/60 bg-primary/40 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Toggle
          size="sm"
          isSelected={isSelected}
          isDisabled={isDisabled}
          onChange={onChange}
          aria-label={label}
        />
        <span className={cx('truncate text-sm font-medium', isDisabled ? 'text-quaternary' : 'text-primary')}>
          {label}
        </span>
        {isDisabled && (
          <Badge color="gray" size="sm">
            Soon
          </Badge>
        )}
      </div>
      <Tooltip title={label} description={tooltip}>
        <TooltipTrigger>
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-fg-quaternary transition hover:text-secondary"
            onClick={(event) => event.stopPropagation()}
          >
            <HelpCircle className="size-4" />
          </a>
        </TooltipTrigger>
      </Tooltip>
    </div>
  );
}

export function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showError = useTooltipStore((state) => state.showError);
  const user = useUserStore((state) => state.user);
  const [aiHealth, setAiHealth] = useState<AiHealthResponse | null>(null);
  const [isCheckingAi, setIsCheckingAi] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CalendarRefreshResponse | null>(null);
  const [enabledSourceIds, setEnabledSourceIds] = useState<Set<string>>(
    () => new Set(DEFAULT_ENABLED_SOURCE_IDS),
  );
  const [enabledMetadataIds, setEnabledMetadataIds] = useState<Set<string>>(
    () => new Set(getEnabledMetadataSourceIds()),
  );
  const [translateEnabled, setTranslateEnabled] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await apiInstance.get<AiHealthResponse>('/ai/models/health');
        setAiHealth(data);
      } catch {
        setAiHealth(null);
      } finally {
        setIsCheckingAi(false);
      }
    })();
  }, []);

  const sourcesByCategory = useMemo(
    () =>
      SYNC_SOURCE_CATEGORIES.map((category) => ({
        category,
        calendarSources: SYNC_SOURCES.filter(
          (source) => source.category === category && source.kind === 'calendar',
        ),
        metadataSources: SYNC_SOURCES.filter(
          (source) => source.category === category && source.kind === 'metadata',
        ),
      })),
    [],
  );

  const toggleSource = (sourceId: string, selected: boolean) => {
    setEnabledSourceIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(sourceId);
      } else {
        next.delete(sourceId);
      }
      return next;
    });
  };

  const toggleMetadataSource = (sourceId: string, selected: boolean) => {
    setEnabledMetadataIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(sourceId);
      } else {
        next.delete(sourceId);
      }
      setEnabledMetadataSourceIds([...next]);
      return next;
    });
  };

  const handleRefresh = async () => {
    const activeMediaTypes = SYNC_SOURCES.filter(
      (source) =>
        source.kind === 'calendar' && source.available && source.mediaType && enabledSourceIds.has(source.id),
    ).map((source) => source.mediaType!);

    const metadataSources = [...enabledMetadataIds]
      .map((id) => METADATA_SOURCE_ID_MAP[id])
      .filter((id): id is EnrichmentSourceId => Boolean(id));

    if (activeMediaTypes.length === 0) {
      showError(t('admin.noSourcesSelected'));
      return;
    }

    setIsRefreshing(true);
    try {
      const result = await refreshCalendar({
        sources: activeMediaTypes,
        metadataSources: metadataSources.length > 0 ? metadataSources : undefined,
        metadata: metadataSources.length > 0,
        translate: translateEnabled,
      });
      setLastRefresh(result.lastSyncedAt);
      setLastResult(result);

      if (result.sourceErrors && Object.keys(result.sourceErrors).length > 0) {
        showError(
          t('plans.refreshPartialError', {
            sources: Object.keys(result.sourceErrors).join(', '),
          }),
        );
      }
    } catch {
      showError(t('plans.refreshError'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const isAiHealthy =
    aiHealth?.status === 'ok' || Object.values(aiHealth?.models ?? {}).some((model) => model.ok);

  return (
    <section className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary">
            <Shield01 className="size-6 text-brand-secondary" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-display-xs font-semibold text-primary">{t('admin.title')}</h1>
              <Badge color="brand" size="sm">
                {t('admin.role')}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-tertiary">{t('admin.subtitle')}</p>
            <p className="mt-2 text-xs text-quaternary">{user?.email}</p>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-primary">{t('admin.calendarSync')}</h2>
            <p className="mt-1 text-xs text-tertiary">{t('admin.calendarSyncHint')}</p>
            <p className="mt-2 text-xs text-quaternary">
              {lastRefresh
                ? `${t('admin.lastRefresh')}: ${new Date(lastRefresh).toLocaleString()}`
                : t('admin.never')}
            </p>
          </div>
          <Button
            color="primary"
            size="sm"
            iconLeading={RefreshCw05}
            isLoading={isRefreshing}
            onClick={() => void handleRefresh()}
          >
            {t('admin.refreshCalendar')}
          </Button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {sourcesByCategory.map(({ category, calendarSources, metadataSources }) => (
            <div key={category} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                {t(CATEGORY_LABEL_KEYS[category])}
              </h3>
              <div className="flex flex-col gap-2">
                {calendarSources.map((source) => (
                  <SourceToggleRow
                    key={source.id}
                    label={t(source.labelKey)}
                    tooltip={t(source.tooltipKey)}
                    docsUrl={source.docsUrl}
                    isSelected={enabledSourceIds.has(source.id)}
                    isDisabled={!source.available}
                    onChange={(selected) => toggleSource(source.id, selected)}
                  />
                ))}
              </div>
              {metadataSources.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-quaternary">
                    {t('admin.metadataSources')}
                  </p>
                  {metadataSources.map((source) => (
                    <SourceToggleRow
                      key={source.id}
                      label={t(source.labelKey)}
                      tooltip={t(source.tooltipKey)}
                      docsUrl={source.docsUrl}
                      isSelected={enabledMetadataIds.has(source.id)}
                      isDisabled={!source.available}
                      onChange={(selected) => toggleMetadataSource(source.id, selected)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-secondary/60 bg-primary/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary">{t('admin.translationSettings')}</h3>
              <p className="mt-1 text-xs text-tertiary">{t('admin.translationSettingsHint')}</p>
            </div>
            <Toggle
              size="sm"
              isSelected={translateEnabled}
              onChange={setTranslateEnabled}
              label={t('admin.translateTitles')}
            />
          </div>

          <p className="mt-3 text-xs text-tertiary">{t('admin.translationPriorityHint')}</p>
        </div>

        {lastResult && (
          <div className="mt-4 rounded-xl border border-secondary/60 bg-secondary/20 px-4 py-3 text-xs text-tertiary">
            <p>
              {t('admin.lastSyncResult', {
                synced: lastResult.synced,
                translated: lastResult.translated,
              })}
            </p>
            <p className="mt-1">
              {Object.entries(lastResult.bySource)
                .map(([source, count]) => `${source}: ${count}`)
                .join(' · ')}
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-primary">{t('admin.aiHealth')}</h2>
          <div className="mt-3 flex items-center gap-2">
            {isCheckingAi ? (
              <>
                <LoadingSpinner size={18} className="text-brand-secondary" />
                <span className="text-sm text-tertiary">{t('admin.checking')}</span>
              </>
            ) : (
              <Badge color={isAiHealthy ? 'success' : 'error'} size="sm">
                {isAiHealthy ? t('admin.healthy') : t('admin.unhealthy')}
              </Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-primary">{t('admin.quickActions')}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button color="secondary" size="sm" onClick={() => navigate('/plans/watching/current')}>
              {t('admin.goToPlans')}
            </Button>
            <Button color="secondary" size="sm" onClick={() => navigate('/development')}>
              {t('nav.development')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
