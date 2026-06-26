export interface AniHubDubbingStudio {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface AniHubAnime {
  id: number;
  mal_id: number | null;
  anilist_id: number | null;
  slug: string;
  title_ukrainian: string | null;
  title_original: string | null;
  title_english: string | null;
  status: string;
  type: string;
  year: number | null;
  has_ukrainian_dub: boolean;
  poster_url: string | null;
  banner_url: string | null;
  episodes_count: number | null;
  imdb_id: string | null;
  description: string | null;
  genres: string[];
  dubbing_studios?: AniHubDubbingStudio[];
  rating: number | null;
}

export interface AniHubListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
  next_page: number | null;
  previous_page: number | null;
  items: AniHubAnime[];
}

export interface AniHubAnimeDetails extends AniHubAnime {
  dubbing_studios: AniHubDubbingStudio[];
}
