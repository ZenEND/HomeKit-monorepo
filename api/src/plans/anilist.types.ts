export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AniListFuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AniListCoverImage {
  extraLarge: string | null;
  large: string | null;
}

export interface AniListNextAiringEpisode {
  id: number;
  episode: number;
  airingAt: number;
}

export interface AniListStudio {
  name: string;
}

export interface AniListTag {
  name: string;
  rank: number;
}

export type AniListStatus =
  | 'FINISHED'
  | 'RELEASING'
  | 'NOT_YET_RELEASED'
  | 'CANCELLED'
  | 'HIATUS';

export type AniListSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface AniListAnime {
  id: number;
  idMal: number | null;
  title: AniListTitle;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  episodes: number | null;
  status: AniListStatus | null;
  season: AniListSeason | null;
  seasonYear: number | null;
  startDate: AniListFuzzyDate | null;
  endDate: AniListFuzzyDate | null;
  coverImage: AniListCoverImage | null;
  nextAiringEpisode: AniListNextAiringEpisode | null;
  siteUrl: string | null;
  studios: { nodes: AniListStudio[] } | null;
  tags: AniListTag[];
}

export interface AniListResponse {
  data: {
    Media: AniListAnime | null;
  };
}
