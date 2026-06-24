export interface YaniPoster {
  fullsize?: string;
  big?: string;
  medium?: string;
  small?: string;
  huge?: string;
  mega?: string;
}

export interface YaniGenre {
  id: number;
  title: string;
  alias: string;
  url?: string;
}

export interface YaniRemoteIds {
  myanimelist_id?: number;
  shikimori_id?: number;
  anilibria_alias?: string;
  kp_id?: number;
  worldart_id?: number;
}

export interface YaniRating {
  average?: number;
  counters?: number;
  myanimelist_rating?: number;
  shikimori_rating?: number;
  kp_rating?: number;
}

export interface YaniAnimeSummary {
  anime_id: number;
  anime_url: string;
  title: string;
  description?: string;
  poster?: YaniPoster;
  year?: number;
  rating?: YaniRating;
  genres?: YaniGenre[];
  remote_ids?: YaniRemoteIds;
  type?: { name?: string; alias?: string };
  anime_status?: { title?: string; alias?: string };
}

export interface YaniAnimeDetails extends YaniAnimeSummary {
  duration?: number;
  views?: number;
  season?: number;
}

export interface YaniSearchResponse {
  response?: YaniAnimeSummary[];
}

export interface YaniAnimeResponse {
  response?: YaniAnimeDetails;
}
