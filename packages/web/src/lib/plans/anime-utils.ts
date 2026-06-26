import type { CalendarItem, Plan, SimklEpisode } from '@/api/plans';

export function formatAirDate(isoDate: string, language: 'en' | 'ua'): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(language === 'ua' ? 'uk-UA' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatAirTime(isoDate: string, language: 'en' | 'ua'): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(language === 'ua' ? 'uk-UA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatEpisode(episode: SimklEpisode | null, language: 'en' | 'ua'): string | null {
  if (!episode) return null;
  if (typeof episode.season !== 'number' || typeof episode.episode !== 'number') return null;

  if (language === 'ua') {
    return `Сезон ${episode.season} · Епізод ${episode.episode}`;
  }

  return `Season ${episode.season} · Episode ${episode.episode}`;
}

export function getRatingLabel(item: CalendarItem): string | null {
  const mal = item.ratings?.mal?.rating;
  const simkl = item.ratings?.simkl?.rating;
  const imdb = item.ratings?.imdb?.rating;

  if (mal) return `MAL ${mal}`;
  if (simkl) return `Simkl ${simkl}`;
  if (imdb) return `IMDb ${imdb}`;
  return null;
}

// Bayesian weighted score: penalises titles with few votes by pulling their
// raw rating toward the assumed global mean. This prevents a title with 5 votes
// and a perfect 10 from outranking a well-established 8.3 with thousands of votes.
//
// Formula: (v * r + C * m) / (v + C)
//   r  – raw rating (0–10)
//   v  – vote count
//   C  – credibility threshold: votes needed before we fully trust the rating
//   m  – assumed global mean for the collection
const BAYESIAN_MIN_VOTES = 500;
const BAYESIAN_MEAN = 6.5;

export function getQualityScore(item: CalendarItem): number {
  const source =
    item.ratings?.mal ??
    item.ratings?.simkl ??
    item.ratings?.imdb ??
    null;

  if (!source) return 0;

  const { rating: r, votes: v } = source;
  if (!r || !v) return 0;

  return (v * r + BAYESIAN_MIN_VOTES * BAYESIAN_MEAN) / (v + BAYESIAN_MIN_VOTES);
}

export function getDisplayTitle(
  item: Pick<CalendarItem, 'title' | 'titleEn' | 'titleUa'>,
  language: 'en' | 'ua',
): string {
  if (language === 'ua') {
    return item.titleUa ?? item.titleEn ?? item.title;
  }

  return item.titleEn ?? item.title;
}

export function getOriginalTitle(
  item: Pick<CalendarItem, 'title' | 'titleEn' | 'titleUa'>,
  language: 'en' | 'ua',
): string | null {
  const displayTitle = getDisplayTitle(item, language);
  return item.title !== displayTitle ? item.title : null;
}

export function getGenreDisplayName(
  genre: { name: string; name_ukrainian: string | null },
  language: 'en' | 'ua',
): string | null {
  const EMPTY = ['—', '-', '', ' '];
  if (language === 'ua' && genre.name_ukrainian && !EMPTY.includes(genre.name_ukrainian.trim())) {
    return genre.name_ukrainian.trim();
  }
  const name = genre.name?.trim();
  if (!name || EMPTY.includes(name)) return null;
  return name;
}

export function getPlanForItem(itemId: string, plans: Plan[]): Plan | undefined {
  return plans.find((plan) => plan.calendarItemId === itemId);
}

export function groupCalendarByMonth(
  items: CalendarItem[],
  language: 'en' | 'ua',
): { month: string; items: CalendarItem[] }[] {
  const map = new Map<string, CalendarItem[]>();

  for (const item of items) {
    const date = new Date(item.airDate);
    const monthKey = new Intl.DateTimeFormat(language === 'ua' ? 'uk-UA' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);

    const list = map.get(monthKey) ?? [];
    list.push(item);
    map.set(monthKey, list);
  }

  return Array.from(map.entries()).map(([month, monthItems]) => ({
    month,
    items: monthItems,
  }));
}
