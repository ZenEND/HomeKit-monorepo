import type { SimklMediaType } from '@/api/plans';

export type SyncSourceCategory = 'anime' | 'tv' | 'movie';

export type SyncSourceKind = 'calendar' | 'metadata';

export interface SyncSourceDefinition {
  id: string;
  labelKey: string;
  tooltipKey: string;
  docsUrl: string;
  category: SyncSourceCategory;
  kind: SyncSourceKind;
  mediaType?: SimklMediaType;
  available: boolean;
}

export const SYNC_SOURCE_CATEGORIES: SyncSourceCategory[] = ['anime', 'tv', 'movie'];

export const SYNC_SOURCES: SyncSourceDefinition[] = [
  {
    id: 'simkl-anime',
    labelKey: 'admin.source.simklAnime',
    tooltipKey: 'admin.source.simklAnimeTooltip',
    docsUrl: 'https://simkl.docs.apiary.io/',
    category: 'anime',
    kind: 'calendar',
    mediaType: 'anime',
    available: true,
  },
  {
    id: 'jikan',
    labelKey: 'admin.source.jikan',
    tooltipKey: 'admin.source.jikanTooltip',
    docsUrl: 'https://docs.api.jikan.moe/',
    category: 'anime',
    kind: 'metadata',
    available: true,
  },
  {
    id: 'anihub',
    labelKey: 'admin.source.anihub',
    tooltipKey: 'admin.source.anihubTooltip',
    docsUrl: 'https://api.anihub.in.ua/',
    category: 'anime',
    kind: 'metadata',
    available: true,
  },
  {
    id: 'shikimori',
    labelKey: 'admin.source.shikimori',
    tooltipKey: 'admin.source.shikimoriTooltip',
    docsUrl: 'https://shikimori.one/api/doc',
    category: 'anime',
    kind: 'metadata',
    available: true,
  },
  {
    id: 'yani',
    labelKey: 'admin.source.yani',
    tooltipKey: 'admin.source.yaniTooltip',
    docsUrl: 'https://api.yani.tv/swagger',
    category: 'anime',
    kind: 'metadata',
    available: true,
  },
  {
    id: 'anilist',
    labelKey: 'admin.source.anilist',
    tooltipKey: 'admin.source.anilistTooltip',
    docsUrl: 'https://docs.anilist.co/',
    category: 'anime',
    kind: 'metadata',
    available: true,
  },
  {
    id: 'kitsu',
    labelKey: 'admin.source.kitsu',
    tooltipKey: 'admin.source.kitsuTooltip',
    docsUrl: 'https://kitsu.docs.apiary.io/',
    category: 'anime',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'simkl-tv',
    labelKey: 'admin.source.simklTv',
    tooltipKey: 'admin.source.simklTvTooltip',
    docsUrl: 'https://simkl.docs.apiary.io/',
    category: 'tv',
    kind: 'calendar',
    mediaType: 'tv',
    available: true,
  },
  {
    id: 'tmdb-tv',
    labelKey: 'admin.source.tmdbTv',
    tooltipKey: 'admin.source.tmdbTvTooltip',
    docsUrl: 'https://developer.themoviedb.org/docs',
    category: 'tv',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'tvdb',
    labelKey: 'admin.source.tvdb',
    tooltipKey: 'admin.source.tvdbTooltip',
    docsUrl: 'https://thetvdb.com/api-information',
    category: 'tv',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'tvmaze',
    labelKey: 'admin.source.tvmaze',
    tooltipKey: 'admin.source.tvmazeTooltip',
    docsUrl: 'https://www.tvmaze.com/api',
    category: 'tv',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'trakt-tv',
    labelKey: 'admin.source.traktTv',
    tooltipKey: 'admin.source.traktTvTooltip',
    docsUrl: 'https://trakt.docs.apiary.io/',
    category: 'tv',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'simkl-movie',
    labelKey: 'admin.source.simklMovie',
    tooltipKey: 'admin.source.simklMovieTooltip',
    docsUrl: 'https://simkl.docs.apiary.io/',
    category: 'movie',
    kind: 'calendar',
    mediaType: 'movie',
    available: true,
  },
  {
    id: 'tmdb-movie',
    labelKey: 'admin.source.tmdbMovie',
    tooltipKey: 'admin.source.tmdbMovieTooltip',
    docsUrl: 'https://developer.themoviedb.org/docs',
    category: 'movie',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'omdb',
    labelKey: 'admin.source.omdb',
    tooltipKey: 'admin.source.omdbTooltip',
    docsUrl: 'https://www.omdbapi.com/',
    category: 'movie',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'trakt-movie',
    labelKey: 'admin.source.traktMovie',
    tooltipKey: 'admin.source.traktMovieTooltip',
    docsUrl: 'https://trakt.docs.apiary.io/',
    category: 'movie',
    kind: 'calendar',
    available: false,
  },
  {
    id: 'justwatch',
    labelKey: 'admin.source.justwatch',
    tooltipKey: 'admin.source.justwatchTooltip',
    docsUrl: 'https://github.com/dawoudt/JustWatchAPI',
    category: 'movie',
    kind: 'calendar',
    available: false,
  },
];

export const DEFAULT_ENABLED_SOURCE_IDS = SYNC_SOURCES.filter(
  (source) => source.available && source.kind === 'calendar',
).map((source) => source.id);

export const DEFAULT_ENABLED_METADATA_SOURCE_IDS = SYNC_SOURCES.filter(
  (source) => source.available && source.kind === 'metadata',
).map((source) => source.id);

export const METADATA_SOURCE_ID_MAP: Record<string, string> = {
  anilist: 'anilist',
  jikan: 'jikan',
  anihub: 'anihub',
  shikimori: 'shikimori',
  yani: 'yani',
};

/** @deprecated Use METADATA_SOURCE_ID_MAP */
export const ENRICHMENT_SOURCE_ID_MAP = METADATA_SOURCE_ID_MAP;

/** @deprecated Use DEFAULT_ENABLED_METADATA_SOURCE_IDS */
export const DEFAULT_ENABLED_ENRICHMENT_SOURCE_IDS = DEFAULT_ENABLED_METADATA_SOURCE_IDS;
