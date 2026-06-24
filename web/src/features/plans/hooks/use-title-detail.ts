import { useEffect, useState } from 'react';
import {
  getCalendarItemDetail,
  type EnrichmentSourceId,
  type TitleDetailResponse,
} from '@/api/plans';
import { getEnabledMetadataSources } from '@/features/admin/enrichment-sources';
import { getApiErrorMessage } from '@/features/plans/utils/api-error';
import { useTranslation } from '@/lib/i18n/use-translation';

interface UseTitleDetailResult {
  data: TitleDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTitleDetail(calendarItemId: string | undefined): UseTitleDetailResult {
  const { t } = useTranslation();
  const [data, setData] = useState<TitleDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!calendarItemId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sources = ['simkl', ...getEnabledMetadataSources()] as EnrichmentSourceId[];
      const response = await getCalendarItemDetail(calendarItemId, { sources });
      setData(response);
    } catch (err) {
      setError(getApiErrorMessage(err, t('titleDetail.notFound')));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDetail();
  }, [calendarItemId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDetail,
  };
}

export const COMPARISON_FIELDS: Array<{
  key: string;
  labelKey: string;
  format?: (value: unknown) => string;
}> = [
  { key: 'titleUa', labelKey: 'titleDetail.field.titleUa' },
  { key: 'titleEn', labelKey: 'titleDetail.field.titleEn' },
  { key: 'titleOriginal', labelKey: 'titleDetail.field.titleOriginal' },
  { key: 'title', labelKey: 'titleDetail.field.title' },
  { key: 'description', labelKey: 'titleDetail.field.description' },
  {
    key: 'genres',
    labelKey: 'titleDetail.field.genres',
    format: (value) => (Array.isArray(value) ? value.join(', ') : '—'),
  },
  { key: 'rating', labelKey: 'titleDetail.field.rating' },
  { key: 'ratingMal', labelKey: 'titleDetail.field.ratingMal' },
  { key: 'malRating', labelKey: 'titleDetail.field.ratingMal' },
  { key: 'ratingSimkl', labelKey: 'titleDetail.field.ratingSimkl' },
  { key: 'shikimoriRating', labelKey: 'titleDetail.field.ratingShikimori' },
  { key: 'year', labelKey: 'titleDetail.field.year' },
  { key: 'status', labelKey: 'titleDetail.field.status' },
  { key: 'episodes', labelKey: 'titleDetail.field.episodes' },
  { key: 'hasUkrainianDub', labelKey: 'titleDetail.field.hasUkrainianDub' },
  { key: 'posterUrl', labelKey: 'titleDetail.field.posterUrl' },
];

export function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—';
  }

  if (typeof value === 'string' && value.length > 120) {
    return `${value.slice(0, 120)}…`;
  }

  return String(value);
}

export const SOURCE_LABEL_KEYS: Record<EnrichmentSourceId, string> = {
  simkl: 'titleDetail.source.simkl',
  jikan: 'titleDetail.source.jikan',
  anihub: 'titleDetail.source.anihub',
  shikimori: 'titleDetail.source.shikimori',
  yani: 'titleDetail.source.yani',
  anilist: 'titleDetail.source.anilist',
};
