import type { EnrichmentSourceId } from '@/api/plans';
import {
  DEFAULT_ENABLED_METADATA_SOURCE_IDS,
  METADATA_SOURCE_ID_MAP,
} from '@/features/admin/sync-sources';

const STORAGE_KEY = 'homekit-metadata-sources';

export const DEFAULT_METADATA_SOURCES: EnrichmentSourceId[] = [
  'anilist',
  'jikan',
  'anihub',
  'shikimori',
  'yani',
];

function mapAdminIdsToApiSources(adminIds: string[]): EnrichmentSourceId[] {
  return adminIds
    .map((id) => METADATA_SOURCE_ID_MAP[id])
    .filter((id): id is EnrichmentSourceId => Boolean(id));
}

export function getEnabledMetadataSources(): EnrichmentSourceId[] {
  if (typeof window === 'undefined') {
    return DEFAULT_METADATA_SOURCES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem('homekit-enrichment-sources');
    if (!raw) {
      return mapAdminIdsToApiSources(DEFAULT_ENABLED_METADATA_SOURCE_IDS);
    }

    const parsed = JSON.parse(raw) as string[];
    const mapped = mapAdminIdsToApiSources(parsed);
    return mapped.length > 0 ? mapped : DEFAULT_METADATA_SOURCES;
  } catch {
    return DEFAULT_METADATA_SOURCES;
  }
}

export function setEnabledMetadataSourceIds(adminSourceIds: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(adminSourceIds));
}

export function getEnabledMetadataSourceIds(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_ENABLED_METADATA_SOURCE_IDS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem('homekit-enrichment-sources');
    if (!raw) {
      return DEFAULT_ENABLED_METADATA_SOURCE_IDS;
    }

    const parsed = JSON.parse(raw) as string[];
    return parsed.length > 0 ? parsed : DEFAULT_ENABLED_METADATA_SOURCE_IDS;
  } catch {
    return DEFAULT_ENABLED_METADATA_SOURCE_IDS;
  }
}

/** @deprecated Use getEnabledMetadataSources */
export const getEnabledEnrichmentSources = getEnabledMetadataSources;

/** @deprecated Use setEnabledMetadataSourceIds */
export const setEnabledEnrichmentSourceIds = setEnabledMetadataSourceIds;

/** @deprecated Use getEnabledMetadataSourceIds */
export const getEnabledEnrichmentSourceIds = getEnabledMetadataSourceIds;

/** @deprecated Use DEFAULT_METADATA_SOURCES */
export const DEFAULT_ENRICHMENT_SOURCES: EnrichmentSourceId[] = ['simkl', ...DEFAULT_METADATA_SOURCES];
