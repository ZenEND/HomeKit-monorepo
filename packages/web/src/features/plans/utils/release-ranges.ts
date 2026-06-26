function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

/** Anime-style quarter seasons: Winter, Spring, Summer, Fall */
export function getCurrentSeasonBounds(reference = new Date()): { start: Date; end: Date } {
  const year = reference.getFullYear();
  const month = reference.getMonth();

  if (month <= 2) {
    return {
      start: startOfDay(new Date(year, 0, 1)),
      end: endOfDay(new Date(year, 2, 31)),
    };
  }

  if (month <= 5) {
    return {
      start: startOfDay(new Date(year, 3, 1)),
      end: endOfDay(new Date(year, 5, 30)),
    };
  }

  if (month <= 8) {
    return {
      start: startOfDay(new Date(year, 6, 1)),
      end: endOfDay(new Date(year, 8, 30)),
    };
  }

  return {
    start: startOfDay(new Date(year, 9, 1)),
    end: endOfDay(new Date(year, 11, 31)),
  };
}

export function getCurrentSeasonRange(reference = new Date()): { from: string; to: string } {
  const { start, end } = getCurrentSeasonBounds(reference);
  const today = startOfDay(reference);

  return {
    from: toIsoDate(today < start ? start : today),
    to: toIsoDate(end),
  };
}

export function getUpcomingReleasesRange(
  reference = new Date(),
  horizonDays = 180,
): { from: string; to: string } {
  const { end } = getCurrentSeasonBounds(reference);
  const from = startOfDay(addDays(end, 1));
  const to = endOfDay(addDays(from, horizonDays));

  return {
    from: toIsoDate(from),
    to: toIsoDate(to),
  };
}

export function getCurrentSeasonQueryRange(reference = new Date()): { from: string; to: string } {
  const { start, end } = getCurrentSeasonBounds(reference);
  return {
    from: toIsoDate(start),
    to: toIsoDate(end),
  };
}

export interface WeekRange {
  label: string;
  from: string;
  to: string;
}

export function getSeasonWeeks(language: 'en' | 'ua' = 'en', reference = new Date()): WeekRange[] {
  const { start, end } = getCurrentSeasonBounds(reference);
  const fmt = new Intl.DateTimeFormat(language === 'ua' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  const weeks: WeekRange[] = [];
  let cursor = startOfDay(new Date(start));

  while (cursor.getTime() <= end.getTime()) {
    const weekEnd = addDays(cursor, 6);
    const clampedEnd = weekEnd.getTime() <= end.getTime() ? endOfDay(weekEnd) : endOfDay(new Date(end));

    weeks.push({
      label: `${fmt.format(cursor)} – ${fmt.format(clampedEnd)}`,
      from: toIsoDate(cursor),
      to: toIsoDate(clampedEnd),
    });

    cursor = startOfDay(addDays(cursor, 7));
  }

  return weeks;
}

export function getCalendarWeekRange(
  weekOffset = 0,
  language: 'en' | 'ua' = 'en',
  reference = new Date(),
): WeekRange {
  const today = startOfDay(reference);
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = startOfDay(addDays(today, diffToMonday + weekOffset * 7));
  const sunday = endOfDay(addDays(monday, 6));
  const fmt = new Intl.DateTimeFormat(language === 'ua' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  return {
    label: `${fmt.format(monday)} – ${fmt.format(sunday)}`,
    from: toIsoDate(monday),
    to: toIsoDate(sunday),
  };
}

export function getSeasonLabel(language: 'en' | 'ua', reference = new Date()): string {
  const month = reference.getMonth();
  const year = reference.getFullYear();

  if (language === 'ua') {
    if (month <= 2) return `Зима ${year}`;
    if (month <= 5) return `Весна ${year}`;
    if (month <= 8) return `Літо ${year}`;
    return `Осінь ${year}`;
  }

  if (month <= 2) return `Winter ${year}`;
  if (month <= 5) return `Spring ${year}`;
  if (month <= 8) return `Summer ${year}`;
  return `Fall ${year}`;
}
