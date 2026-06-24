export interface AnimeTitleOverride {
  titleUa: string;
  titleEn?: string;
}

/** Manual Ukrainian title overrides keyed by Simkl ID or slug. */
export const ANIME_TITLE_OVERRIDES: Record<string, AnimeTitleOverride> = {
  // Example: '1520136': { titleUa: 'Шлях руїн', titleEn: 'Ruin Road' },
};

export function getTitleOverride(simklId: number, slug: string): AnimeTitleOverride | null {
  return ANIME_TITLE_OVERRIDES[String(simklId)] ?? ANIME_TITLE_OVERRIDES[slug] ?? null;
}
