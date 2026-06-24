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
  studios: string[] | null;
  tags: string[] | null;
  popularity: number | null;
  nextEpisodeNumber: number | null;
  fandubbers: string[] | null;
  fansubbers: string[] | null;
}
