export const ANIME_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Suspense',
  'Ecchi',
  'Award Winning',
  'Boys Love',
  'Girls Love',
  'Gourmet',
  'Avant Garde',
] as const;

export type AnimeGenre = (typeof ANIME_GENRES)[number];

export type GenreFilter = 'all' | AnimeGenre;

export function matchesGenreFilter(
  genres: Array<{ name: string }> | string[] | null | undefined,
  genreFilter: GenreFilter,
): boolean {
  if (genreFilter === 'all') return true;
  if (!genres) return false;
  return genres.some((g) => (typeof g === 'string' ? g : g.name) === genreFilter);
}
