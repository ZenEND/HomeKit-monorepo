export interface SimklRatingValue {
  rating: number;
  votes: number;
}

export interface SimklRatings {
  simkl?: SimklRatingValue;
  imdb?: SimklRatingValue;
  mal?: SimklRatingValue;
}

export interface SimklIds {
  simkl_id: number;
  slug: string;
  imdb?: string;
  tmdb?: string;
  tvdb?: string;
  mal?: number;
  anidb?: number;
  anilist?: number;
  kitsu?: number;
}

export interface SimklEpisode {
  season: number;
  episode: number;
  url?: string;
}

export interface SimklCalendarItem {
  title: string;
  poster: string | null;
  date: string;
  release_date?: string;
  rank?: number;
  url: string;
  ratings?: SimklRatings;
  ids: SimklIds;
  episode?: SimklEpisode;
  /** Genre names included directly in the Simkl calendar feed (present for some items). */
  genres?: string[];
}
