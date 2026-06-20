export type EventCategory = 'game-night' | 'dinner' | 'outdoor' | 'watch-party' | 'trip';

export interface PlannedEvent {
  id: string;
  title: string;
  category: EventCategory;
  emoji: string;
  date: string;
  time: string;
  locationName: string;
  city: string;
  going: number;
  maybe: number;
  host: string;
}

export interface ReleaseSource {
  id: string;
  name: string;
  type: 'calendar' | 'database' | 'tracker' | 'news';
  url: string;
  bestFor: string;
  notes: string;
}

export interface LocationGroup {
  city: string;
  flag: string;
  events: PlannedEvent[];
}

export const categoryLabels: Record<EventCategory, string> = {
  'game-night': 'Game night',
  dinner: 'Dinner',
  outdoor: 'Outdoor',
  'watch-party': 'Watch party',
  trip: 'Trip',
};

export const categoryLabelsUa: Record<EventCategory, string> = {
  'game-night': 'Ігровий вечір',
  dinner: 'Вечеря',
  outdoor: 'На вулиці',
  'watch-party': 'Перегляд',
  trip: 'Поїздка',
};

export const categoryColors: Record<EventCategory, 'brand' | 'success' | 'warning' | 'sky' | 'purple'> = {
  'game-night': 'brand',
  dinner: 'warning',
  outdoor: 'success',
  'watch-party': 'sky',
  trip: 'purple',
};

export const plannedEvents: PlannedEvent[] = [
  {
    id: 'e1',
    title: 'F1 Spanish GP Watch Party',
    category: 'watch-party',
    emoji: '🏎️',
    date: 'Jun 28, 2026',
    time: '15:00',
    locationName: 'Home Living Room',
    city: 'Warsaw',
    going: 6,
    maybe: 2,
    host: 'You',
  },
  {
    id: 'e2',
    title: 'Friday Game Night — Mafia',
    category: 'game-night',
    emoji: '🎮',
    date: 'Jul 3, 2026',
    time: '19:30',
    locationName: 'Home',
    city: 'Warsaw',
    going: 8,
    maybe: 3,
    host: 'You',
  },
  {
    id: 'e3',
    title: 'Taco Night',
    category: 'dinner',
    emoji: '🌮',
    date: 'Jul 11, 2026',
    time: '18:00',
    locationName: 'Anna & Marek place',
    city: 'Warsaw',
    going: 5,
    maybe: 1,
    host: 'Anna',
  },
  {
    id: 'e4',
    title: 'Lake Picnic & Lawn Games',
    category: 'outdoor',
    emoji: '🧺',
    date: 'Jul 19, 2026',
    time: '12:00',
    locationName: 'Jezioro Zegrzyńskie',
    city: 'Zegrze',
    going: 12,
    maybe: 5,
    host: 'You',
  },
  {
    id: 'e5',
    title: 'Mountain Weekend',
    category: 'trip',
    emoji: '🏔️',
    date: 'Aug 8–10, 2026',
    time: 'All weekend',
    locationName: 'Cabin near Zakopane',
    city: 'Zakopane',
    going: 6,
    maybe: 4,
    host: 'Marek',
  },
  {
    id: 'e6',
    title: 'Rooftop Quiz Night',
    category: 'game-night',
    emoji: '🧠',
    date: 'Aug 15, 2026',
    time: '20:00',
    locationName: 'Skybar Rooftop',
    city: 'Kraków',
    going: 9,
    maybe: 6,
    host: 'Kasia',
  },
  {
    id: 'e7',
    title: 'Italian Dinner Marathon',
    category: 'dinner',
    emoji: '🍝',
    date: 'Aug 22, 2026',
    time: '19:00',
    locationName: 'Home',
    city: 'Kraków',
    going: 4,
    maybe: 2,
    host: 'You',
  },
  {
    id: 'e8',
    title: 'New Series Pilot Night',
    category: 'watch-party',
    emoji: '📺',
    date: 'Sep 5, 2026',
    time: '20:30',
    locationName: 'Home Living Room',
    city: 'Warsaw',
    going: 5,
    maybe: 4,
    host: 'You',
  },
  {
    id: 'e9',
    title: 'Upcoming Movie Trailer Draft',
    category: 'watch-party',
    emoji: '🎬',
    date: 'Sep 12, 2026',
    time: '19:00',
    locationName: 'Home',
    city: 'Warsaw',
    going: 7,
    maybe: 2,
    host: 'You',
  },
  {
    id: 'e10',
    title: 'Horror Premiere Night',
    category: 'watch-party',
    emoji: '👻',
    date: 'Oct 24, 2026',
    time: '22:00',
    locationName: 'Kasia place',
    city: 'Kraków',
    going: 6,
    maybe: 5,
    host: 'Kasia',
  },
  {
    id: 'e11',
    title: 'Oscar Shortlist Marathon',
    category: 'watch-party',
    emoji: '🏆',
    date: 'Jan 16, 2027',
    time: '17:00',
    locationName: 'Home Cinema Room',
    city: 'Warsaw',
    going: 4,
    maybe: 6,
    host: 'You',
  },
];

export const releaseSources: ReleaseSource[] = [
  {
    id: 'justwatch',
    name: 'JustWatch',
    type: 'tracker',
    url: 'https://www.justwatch.com',
    bestFor: 'Finding where a movie or series is streaming in your country',
    notes: 'Great for planning legal watch nights and checking Netflix/HBO/Disney+/Prime availability.',
  },
  {
    id: 'imdb-coming-soon',
    name: 'IMDb Coming Soon',
    type: 'calendar',
    url: 'https://www.imdb.com/calendar/',
    bestFor: 'Upcoming theatrical and streaming release calendars',
    notes: 'Good broad source for release dates, cast, trailers, ratings, and watchlist ideas.',
  },
  {
    id: 'tmdb',
    name: 'TMDb',
    type: 'database',
    url: 'https://www.themoviedb.org',
    bestFor: 'Free-ish metadata API for posters, trailers, trending titles, and release dates',
    notes: 'Best backend option for HomeKit: build a NestJS movie module and cache trending/new releases.',
  },
  {
    id: 'letterboxd',
    name: 'Letterboxd',
    type: 'tracker',
    url: 'https://letterboxd.com',
    bestFor: 'Watchlists, popular lists, friend taste, and movie-night inspiration',
    notes: 'Use manually for planning; official API access is limited, so treat scraping carefully.',
  },
  {
    id: 'rottentomatoes',
    name: 'Rotten Tomatoes',
    type: 'database',
    url: 'https://www.rottentomatoes.com/browse/movies_coming_soon/',
    bestFor: 'Coming soon movies and crowd/critic score checks',
    notes: 'Useful for picking a safe group movie when nobody agrees.',
  },
  {
    id: 'streaming-newsrooms',
    name: 'Netflix / HBO / Disney+ newsrooms',
    type: 'news',
    url: 'https://www.netflix.com/tudum',
    bestFor: 'Official announcements for new seasons, trailers, and premiere dates',
    notes: 'Add a manual source list per platform until you wire automated feeds.',
  },
];

export function groupEventsByCity(events: PlannedEvent[]): LocationGroup[] {
  const flags: Record<string, string> = {
    Warsaw: '🇵🇱',
    Zegrze: '🇵🇱',
    Zakopane: '🇵🇱',
    Kraków: '🇵🇱',
  };
  const map = new Map<string, PlannedEvent[]>();
  for (const event of events) {
    const list = map.get(event.city) ?? [];
    list.push(event);
    map.set(event.city, list);
  }
  return Array.from(map.entries()).map(([city, cityEvents]) => ({
    city,
    flag: flags[city] ?? '📍',
    events: cityEvents,
  }));
}

const eventsUa: Record<string, Pick<PlannedEvent, 'title' | 'locationName' | 'host'>> = {
  e1: {
    title: 'Перегляд F1: Гран-прі Іспанії',
    locationName: 'Вітальня вдома',
    host: 'Ти',
  },
  e2: {
    title: 'Пʼятничний ігровий вечір — Мафія',
    locationName: 'Дім',
    host: 'Ти',
  },
  e3: {
    title: 'Тако-вечір',
    locationName: 'У Анни й Марека',
    host: 'Анна',
  },
  e4: {
    title: 'Пікнік біля озера та ігри на траві',
    locationName: 'Зегжинське озеро',
    host: 'Ти',
  },
  e5: {
    title: 'Вікенд у горах',
    locationName: 'Будиночок біля Закопане',
    host: 'Марек',
  },
  e6: {
    title: 'Вікторина на даху',
    locationName: 'Skybar Rooftop',
    host: 'Кася',
  },
  e7: {
    title: 'Італійський dinner-марафон',
    locationName: 'Дім',
    host: 'Ти',
  },
  e8: {
    title: 'Вечір пілотів нових серіалів',
    locationName: 'Вітальня вдома',
    host: 'Ти',
  },
  e9: {
    title: 'Драфт трейлерів майбутніх фільмів',
    locationName: 'Дім',
    host: 'Ти',
  },
  e10: {
    title: 'Ніч хорор-премʼєри',
    locationName: 'У Касі',
    host: 'Кася',
  },
  e11: {
    title: 'Марафон оскарівського shortlist',
    locationName: 'Домашній кінозал',
    host: 'Ти',
  },
};

const releaseSourcesUa: Record<string, Pick<ReleaseSource, 'name' | 'bestFor' | 'notes'>> = {
  justwatch: {
    name: 'JustWatch',
    bestFor: 'Пошук, де фільм або серіал доступний у твоїй країні',
    notes: 'Добре для легальних watch nights і перевірки Netflix/HBO/Disney+/Prime.',
  },
  'imdb-coming-soon': {
    name: 'IMDb Coming Soon',
    bestFor: 'Календар майбутніх кінотеатральних і streaming-релізів',
    notes: 'Широке джерело дат релізів, касту, трейлерів, рейтингів і watchlist-ідей.',
  },
  tmdb: {
    name: 'TMDb',
    bestFor: 'Метадані/API для постерів, трейлерів, trending titles і дат релізу',
    notes: 'Найкращий backend-варіант для HomeKit: NestJS movie module + кеш новинок.',
  },
  letterboxd: {
    name: 'Letterboxd',
    bestFor: 'Watchlists, популярні списки, смаки друзів і натхнення для кіновечора',
    notes: 'Краще використовувати вручну; офіційний API обмежений, зі scraping обережно.',
  },
  rottentomatoes: {
    name: 'Rotten Tomatoes',
    bestFor: 'Coming soon movies і перевірка оцінок критиків/глядачів',
    notes: 'Корисно, коли група не може домовитися, що дивитися.',
  },
  'streaming-newsrooms': {
    name: 'Netflix / HBO / Disney+ newsrooms',
    bestFor: 'Офіційні анонси нових сезонів, трейлерів і дат премʼєр',
    notes: 'Спочатку ручний список джерел по платформах, потім можна додати автоматичні feeds.',
  },
};

export function localizeEvent(event: PlannedEvent, language: 'en' | 'ua'): PlannedEvent {
  return language === 'ua' && eventsUa[event.id] ? { ...event, ...eventsUa[event.id] } : event;
}

export function getCategoryLabel(category: EventCategory, language: 'en' | 'ua'): string {
  return language === 'ua' ? categoryLabelsUa[category] : categoryLabels[category];
}

export function localizeReleaseSource(source: ReleaseSource, language: 'en' | 'ua'): ReleaseSource {
  return language === 'ua' && releaseSourcesUa[source.id]
    ? { ...source, ...releaseSourcesUa[source.id] }
    : source;
}
