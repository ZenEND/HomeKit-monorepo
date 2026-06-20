// Mock 2026-season-style data for the Formula 1 Fun page.
// Replace with a real API or scraper later (see f1DataSources below).

export interface F1Track {
  round: number;
  name: string;
  circuit: string;
  country: string;
  flag: string;
  date: string;
  status: 'completed' | 'next' | 'upcoming';
  laps: number;
  lengthKm: number;
}

export interface F1Driver {
  position: number;
  name: string;
  team: string;
  number: number;
  points: number;
  wins: number;
  nationality: string;
  flag: string;
}

export interface F1Constructor {
  position: number;
  team: string;
  points: number;
  color: string;
}

export interface F1RacePosition {
  position: number;
  driver: string;
  team: string;
  time: string;
  fastestLap: boolean;
}

export interface F1DataSource {
  id: string;
  name: string;
  type: 'api' | 'scraper';
  cost: string;
  url: string;
  notes: string;
}

export const f1Calendar: F1Track[] = [
  { round: 1, name: 'Australian GP', circuit: 'Albert Park', country: 'Australia', flag: '🇦🇺', date: 'Mar 8, 2026', status: 'completed', laps: 58, lengthKm: 5.278 },
  { round: 2, name: 'Chinese GP', circuit: 'Shanghai Intl', country: 'China', flag: '🇨🇳', date: 'Mar 22, 2026', status: 'completed', laps: 56, lengthKm: 5.451 },
  { round: 3, name: 'Japanese GP', circuit: 'Suzuka', country: 'Japan', flag: '🇯🇵', date: 'Apr 12, 2026', status: 'completed', laps: 53, lengthKm: 5.807 },
  { round: 4, name: 'Bahrain GP', circuit: 'Sakhir', country: 'Bahrain', flag: '🇧🇭', date: 'Apr 26, 2026', status: 'completed', laps: 57, lengthKm: 5.412 },
  { round: 5, name: 'Saudi Arabian GP', circuit: 'Jeddah Corniche', country: 'Saudi Arabia', flag: '🇸🇦', date: 'May 10, 2026', status: 'completed', laps: 50, lengthKm: 6.174 },
  { round: 6, name: 'Miami GP', circuit: 'Miami Intl Autodrome', country: 'USA', flag: '🇺🇸', date: 'May 24, 2026', status: 'completed', laps: 57, lengthKm: 5.412 },
  { round: 7, name: 'Canadian GP', circuit: 'Gilles Villeneuve', country: 'Canada', flag: '🇨🇦', date: 'Jun 14, 2026', status: 'completed', laps: 70, lengthKm: 4.361 },
  { round: 8, name: 'Spanish GP', circuit: 'Barcelona-Catalunya', country: 'Spain', flag: '🇪🇸', date: 'Jun 28, 2026', status: 'next', laps: 66, lengthKm: 4.657 },
  { round: 9, name: 'Austrian GP', circuit: 'Red Bull Ring', country: 'Austria', flag: '🇦🇹', date: 'Jul 5, 2026', status: 'upcoming', laps: 71, lengthKm: 4.318 },
  { round: 10, name: 'British GP', circuit: 'Silverstone', country: 'United Kingdom', flag: '🇬🇧', date: 'Jul 19, 2026', status: 'upcoming', laps: 52, lengthKm: 5.891 },
  { round: 11, name: 'Hungarian GP', circuit: 'Hungaroring', country: 'Hungary', flag: '🇭🇺', date: 'Aug 2, 2026', status: 'upcoming', laps: 70, lengthKm: 4.381 },
  { round: 12, name: 'Dutch GP', circuit: 'Zandvoort', country: 'Netherlands', flag: '🇳🇱', date: 'Aug 30, 2026', status: 'upcoming', laps: 72, lengthKm: 4.259 },
  { round: 13, name: 'Italian GP', circuit: 'Monza', country: 'Italy', flag: '🇮🇹', date: 'Sep 6, 2026', status: 'upcoming', laps: 53, lengthKm: 5.793 },
  { round: 14, name: 'Singapore GP', circuit: 'Marina Bay', country: 'Singapore', flag: '🇸🇬', date: 'Sep 20, 2026', status: 'upcoming', laps: 62, lengthKm: 4.940 },
];

export const driverStandings: F1Driver[] = [
  { position: 1, name: 'Max Verstappen', team: 'Red Bull Racing', number: 1, points: 178, wins: 5, nationality: 'Dutch', flag: '🇳🇱' },
  { position: 2, name: 'Lando Norris', team: 'McLaren', number: 4, points: 162, wins: 3, nationality: 'British', flag: '🇬🇧' },
  { position: 3, name: 'Charles Leclerc', team: 'Ferrari', number: 16, points: 149, wins: 2, nationality: 'Monégasque', flag: '🇲🇨' },
  { position: 4, name: 'Oscar Piastri', team: 'McLaren', number: 81, points: 141, wins: 2, nationality: 'Australian', flag: '🇦🇺' },
  { position: 5, name: 'George Russell', team: 'Mercedes', number: 63, points: 118, wins: 1, nationality: 'British', flag: '🇬🇧' },
  { position: 6, name: 'Carlos Sainz', team: 'Williams', number: 55, points: 97, wins: 0, nationality: 'Spanish', flag: '🇪🇸' },
  { position: 7, name: 'Lewis Hamilton', team: 'Ferrari', number: 44, points: 89, wins: 0, nationality: 'British', flag: '🇬🇧' },
  { position: 8, name: 'Andrea Kimi Antonelli', team: 'Mercedes', number: 12, points: 64, wins: 0, nationality: 'Italian', flag: '🇮🇹' },
  { position: 9, name: 'Fernando Alonso', team: 'Aston Martin', number: 14, points: 41, wins: 0, nationality: 'Spanish', flag: '🇪🇸' },
  { position: 10, name: 'Yuki Tsunoda', team: 'Red Bull Racing', number: 22, points: 38, wins: 0, nationality: 'Japanese', flag: '🇯🇵' },
];

export const constructorStandings: F1Constructor[] = [
  { position: 1, team: 'McLaren', points: 303, color: '#FF8000' },
  { position: 2, team: 'Red Bull Racing', points: 216, color: '#3671C6' },
  { position: 3, team: 'Ferrari', points: 238, color: '#E8002D' },
  { position: 4, team: 'Mercedes', points: 182, color: '#27F4D2' },
  { position: 5, team: 'Williams', points: 114, color: '#64C4FF' },
  { position: 6, team: 'Aston Martin', points: 58, color: '#229971' },
];

export const lastRacePositions: F1RacePosition[] = [
  { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing', time: '1:33:24.521', fastestLap: false },
  { position: 2, driver: 'Lando Norris', team: 'McLaren', time: '+3.412s', fastestLap: true },
  { position: 3, driver: 'Charles Leclerc', team: 'Ferrari', time: '+8.901s', fastestLap: false },
  { position: 4, driver: 'Oscar Piastri', team: 'McLaren', time: '+12.337s', fastestLap: false },
  { position: 5, driver: 'George Russell', team: 'Mercedes', time: '+19.882s', fastestLap: false },
  { position: 6, driver: 'Lewis Hamilton', team: 'Ferrari', time: '+24.104s', fastestLap: false },
  { position: 7, driver: 'Carlos Sainz', team: 'Williams', time: '+31.756s', fastestLap: false },
  { position: 8, driver: 'Fernando Alonso', team: 'Aston Martin', time: '+38.220s', fastestLap: false },
];

export const lastRaceName = 'Canadian GP — Round 7';
export const lastRaceNameUa = 'Гран-прі Канади — Раунд 7';

export const f1DataSources: F1DataSource[] = [
  {
    id: 'jolpica',
    name: 'Jolpica-F1 (Ergast successor)',
    type: 'api',
    cost: 'Free, open',
    url: 'https://github.com/jolpica/jolpica-f1',
    notes: 'Drop-in replacement for the retired Ergast API. JSON for schedule, standings, results. Best default — no key required.',
  },
  {
    id: 'openf1',
    name: 'OpenF1 API',
    type: 'api',
    cost: 'Free (live + historical)',
    url: 'https://openf1.org',
    notes: 'Real-time telemetry, positions, intervals, radio. Great for a live race dashboard. Rate-limit friendly.',
  },
  {
    id: 'fastf1',
    name: 'FastF1 (Python)',
    type: 'scraper',
    cost: 'Free library',
    url: 'https://docs.fastf1.dev',
    notes: 'Pull timing/telemetry into a cron job, store in Postgres, expose via NestJS. Good backend-learning project.',
  },
  {
    id: 'wikipedia-scrape',
    name: 'Wikipedia season scraper',
    type: 'scraper',
    cost: 'Free',
    url: 'https://en.wikipedia.org',
    notes: 'Cheerio/Playwright scraper for calendar + results as a fallback. Cache in Redis, respect robots.txt.',
  },
];

export function getNextRace(): F1Track | undefined {
  return f1Calendar.find((t) => t.status === 'next');
}

export function getSeasonProgress(): { completed: number; total: number; percent: number } {
  const total = f1Calendar.length;
  const completed = f1Calendar.filter((t) => t.status === 'completed').length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

const f1DataSourcesUa: Record<string, Pick<F1DataSource, 'name' | 'cost' | 'notes'>> = {
  jolpica: {
    name: 'Jolpica-F1 (наступник Ergast)',
    cost: 'Безкоштовно, open source',
    notes:
      'Drop-in заміна retired Ergast API. JSON для розкладу, заліку й результатів. Найкращий дефолт — ключ не потрібен.',
  },
  openf1: {
    name: 'OpenF1 API',
    cost: 'Безкоштовно (live + історія)',
    notes:
      'Телеметрія, позиції, інтервали й радіо в реальному часі. Добре для live race dashboard. Дружній до rate limits.',
  },
  fastf1: {
    name: 'FastF1 (Python)',
    cost: 'Безкоштовна бібліотека',
    notes:
      'Забирай timing/telemetry у cron job, зберігай у Postgres і віддавай через NestJS. Хороший backend-learning проєкт.',
  },
  'wikipedia-scrape': {
    name: 'Скрапер сезону з Wikipedia',
    cost: 'Безкоштовно',
    notes:
      'Cheerio/Playwright scraper для календаря й результатів як fallback. Кешуй у Redis і поважай robots.txt.',
  },
};

export function localizeF1DataSource(source: F1DataSource, language: 'en' | 'ua'): F1DataSource {
  return language === 'ua' && f1DataSourcesUa[source.id]
    ? { ...source, ...f1DataSourcesUa[source.id] }
    : source;
}
