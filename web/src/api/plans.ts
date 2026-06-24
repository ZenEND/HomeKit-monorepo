import { apiInstance } from './instance';

export type SimklMediaType = 'anime' | 'tv' | 'movie';
export type SimklMediaTypeFilter = SimklMediaType | 'all';

export type PlanActivityType =
  | 'watching'
  | 'racing'
  | 'cooking'
  | 'party'
  | 'boardgame'
  | 'partygame';

export type PlanActivityTypeFilter = PlanActivityType | 'all';

export interface SimklRatings {
  simkl?: { rating: number; votes: number };
  imdb?: { rating: number; votes: number };
  mal?: { rating: number; votes: number };
}

export interface SimklEpisode {
  season: number;
  episode: number;
  url?: string;
}

export type TitleTranslationSource =
  | 'mal'
  | 'manual'
  | 'ai'
  | 'mymemory'
  | 'lingva'
  | 'anihub'
  | null;

export interface Genre {
  id: string;
  name: string;
  slug: string;
  name_ukrainian: string | null;
}

export interface CalendarItem {
  id: string;
  mediaType: SimklMediaType;
  simklId: number | null;
  malId: number | null;
  anilistId: number | null;
  slug: string;
  title: string;
  titleEn: string | null;
  titleUa: string | null;
  titleOriginal: string | null;
  titleTranslationSource: TitleTranslationSource;
  airDate: string;
  releaseDate: string | null;
  posterUrl: string;
  sourceUrl: string | null;
  rank: number | null;
  ratings: SimklRatings | null;
  mergedRatings: MergedTitleRatings | null;
  ids: {
    simkl_id?: number;
    slug: string;
    mal?: number;
    anilist?: number;
  } | null;
  episode: SimklEpisode | null;
  genres: Genre[] | null;
  description: string | null;
  year: number | null;
  airingStatus: string | null;
  episodes: number | null;
  hasUkrainianDub: boolean | null;
  nextEpisodeAiringAt: string | null;
  syncedAt: string;
  enrichedAt: string | null;
}

export interface CalendarListResponse {
  items: CalendarItem[];
  lastSyncedAt: string | null;
  total: number;
}

export interface CalendarRefreshResponse {
  synced: number;
  translated: number;
  lastSyncedAt: string;
  bySource: Record<string, number>;
  sourceErrors?: Record<string, string>;
}

export type PlanStatus = 'planned' | 'watched' | 'dropped';

export interface Plan {
  id: string;
  activityType: PlanActivityType;
  title: string;
  titleEn: string | null;
  titleUa: string | null;
  posterUrl: string;
  plannedDate: string | null;
  notes: string | null;
  status: PlanStatus;
  sourceUrl: string | null;
  mediaType: SimklMediaType | null;
  episode: SimklEpisode | null;
  calendarItemId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  activityType?: PlanActivityType;
  calendarItemId?: string;
  title?: string;
  plannedDate?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export type PlanStatusFilter = 'planned' | 'watched' | 'dropped' | 'all';

export interface PlansQueryParams {
  activityType?: PlanActivityTypeFilter;
  status?: PlanStatusFilter;
  from?: string;
  to?: string;
}

export interface CalendarQueryParams {
  source?: SimklMediaTypeFilter;
  from?: string;
  to?: string;
}

export interface CalendarRefreshParams {
  source?: SimklMediaTypeFilter;
  sources?: SimklMediaType[];
  metadataSources?: EnrichmentSourceId[];
  metadata?: boolean;
  translate?: boolean;
}

export interface IdeaCard {
  id: string;
  title: string;
  emoji: string;
  vibe: string | null;
  groupSize: string | null;
  summary: string;
  howItWorks: string[] | null;
  homekitTieIn: string | null;
  posterUrl: string | null;
  rank: number | null;
  rating: number | null;
  tag: 'trending' | 'top-rated' | null;
}

export interface RecommendationSection {
  section: string;
  title: string;
  items: IdeaCard[];
}

export interface RecommendationsResponse {
  activity: PlanActivityType;
  sections: RecommendationSection[];
}

export async function getCalendar(
  params: CalendarQueryParams = {},
): Promise<CalendarListResponse> {
  const { data } = await apiInstance.get<CalendarListResponse>('/plans/calendar', { params });
  return data;
}

export async function refreshCalendar(
  params: CalendarRefreshParams = {},
): Promise<CalendarRefreshResponse> {
  const { sources, metadataSources, ...rest } = params;
  const { data } = await apiInstance.post<CalendarRefreshResponse>(
    '/plans/calendar/refresh',
    undefined,
    {
      params: {
        ...rest,
        ...(sources?.length ? { sources: sources.join(',') } : {}),
        ...(metadataSources?.length ? { metadataSources: metadataSources.join(',') } : {}),
      },
    },
  );
  return data;
}

export async function getRecommendations(
  activity: PlanActivityType,
): Promise<RecommendationsResponse> {
  const { data } = await apiInstance.get<RecommendationsResponse>('/plans/recommendations', {
    params: { activity },
  });
  return data;
}

export async function getUserPlans(params: PlansQueryParams = {}): Promise<Plan[]> {
  const { data } = await apiInstance.get<Plan[]>('/plans', { params });
  return data;
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  const { data } = await apiInstance.post<Plan>('/plans', payload);
  return data;
}

export async function updatePlanStatus(
  planId: string,
  status: Extract<PlanStatus, 'planned' | 'watched' | 'dropped'>,
): Promise<Plan> {
  const { data } = await apiInstance.patch<Plan>(`/plans/${planId}/status`, { status });
  return data;
}

export async function deletePlan(planId: string): Promise<void> {
  await apiInstance.delete(`/plans/${planId}`);
}

export type EnrichmentSourceId = 'simkl' | 'jikan' | 'anihub' | 'shikimori' | 'yani' | 'anilist';

export type EnrichmentSourceStatus = 'ok' | 'error' | 'skipped' | 'not_found';

export interface EnrichmentFieldValue {
  value: string | number | boolean | string[] | null;
  label?: string;
}

export interface EnrichmentSourceSnapshot {
  source: EnrichmentSourceId;
  status: EnrichmentSourceStatus;
  error?: string;
  fields: Record<string, EnrichmentFieldValue>;
  raw?: Record<string, unknown>;
}

export interface MergedTitleRatings {
  mal: number | null;
  shikimori: number | null;
  yani: number | null;
  simkl: number | null;
  imdb: number | null;
  anilist: number | null;
}

export interface MergedTitleDetail {
  title: string;
  titleEn: string | null;
  titleUa: string | null;
  titleOriginal: string | null;
  description: string | null;
  posterUrl: string | null;
  genres: string[];
  ratings: MergedTitleRatings;
  hasUkrainianDub: boolean | null;
  year: number | null;
  status: string | null;
  episodes: number | null;
  externalLinks: Array<{ label: string; url: string }>;
}

export interface TitleDetailResponse {
  item: CalendarItem;
  merged: MergedTitleDetail;
  sources: EnrichmentSourceSnapshot[];
}

export interface TitleDetailQueryParams {
  sources?: EnrichmentSourceId[];
}

export async function getCalendarItemDetail(
  id: string,
  params: TitleDetailQueryParams = {},
): Promise<TitleDetailResponse> {
  const { sources, ...rest } = params;
  const { data } = await apiInstance.get<TitleDetailResponse>(`/plans/calendar/${id}`, {
    params: {
      ...rest,
      ...(sources?.length ? { sources: sources.join(',') } : {}),
    },
  });
  return data;
}
