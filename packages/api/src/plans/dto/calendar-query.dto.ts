import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
} from 'class-validator';
import { SimklMediaType, SimklMediaTypeFilter } from '../plans.enums';
import type { EnrichmentSourceId } from '../title-enrichment.types';
import { DEFAULT_METADATA_SOURCES } from '../media-metadata.service';

function parseBooleanQuery(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') {
    return true;
  }
  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  return undefined;
}

function parseSourcesQuery(value: unknown): SimklMediaType[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  const sources = rawValues
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry): entry is SimklMediaType =>
      Object.values(SimklMediaType).includes(entry as SimklMediaType),
    );

  return sources.length > 0 ? [...new Set(sources)] : undefined;
}

const METADATA_SOURCES: EnrichmentSourceId[] = ['jikan', 'anihub', 'shikimori', 'yani'];

function parseMetadataSources(value: unknown): EnrichmentSourceId[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  const sources = rawValues
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry): entry is EnrichmentSourceId =>
      METADATA_SOURCES.includes(entry as EnrichmentSourceId),
    );

  return sources.length > 0 ? [...new Set(sources)] : undefined;
}

export class CalendarQueryDto {
  @ApiPropertyOptional({
    description: 'Simkl calendar feed to read from cache.',
    enum: SimklMediaTypeFilter,
    default: SimklMediaTypeFilter.All,
  })
  @IsOptional()
  @IsIn(Object.values(SimklMediaTypeFilter))
  source?: SimklMediaTypeFilter;

  @ApiPropertyOptional({
    description: 'Include items airing on or after this date (ISO 8601 date).',
    example: '2026-06-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Include items airing on or before this date (ISO 8601 date).',
    example: '2026-06-30',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class CalendarRefreshQueryDto {
  @ApiPropertyOptional({
    description: 'Which Simkl feeds to refresh. Defaults to all feeds.',
    enum: SimklMediaTypeFilter,
    default: SimklMediaTypeFilter.All,
  })
  @IsOptional()
  @IsIn(Object.values(SimklMediaTypeFilter))
  source?: SimklMediaTypeFilter;

  @ApiPropertyOptional({
    description: 'Explicit list of Simkl feeds to refresh (comma-separated or repeated).',
    enum: SimklMediaType,
    isArray: true,
    example: ['anime', 'tv'],
  })
  @IsOptional()
  @Transform(({ value }) => parseSourcesQuery(value))
  @IsArray()
  @IsIn(Object.values(SimklMediaType), { each: true })
  sources?: SimklMediaType[];

  @ApiPropertyOptional({
    description: 'Whether to translate missing Ukrainian titles after sync.',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => parseBooleanQuery(value))
  @IsBoolean()
  translate?: boolean;

  @ApiPropertyOptional({
    description:
      'Anime metadata sources to fetch and merge during sync (comma-separated). Defaults to all supported metadata providers.',
    enum: METADATA_SOURCES,
    isArray: true,
    example: 'jikan,anihub,shikimori,yani',
  })
  @IsOptional()
  @Transform(({ value }) => parseMetadataSources(value))
  @IsArray()
  @IsIn(METADATA_SOURCES, { each: true })
  metadataSources?: EnrichmentSourceId[];

  @ApiPropertyOptional({
    description: 'Whether to merge anime metadata from external sources during sync.',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => parseBooleanQuery(value))
  @IsBoolean()
  metadata?: boolean;
}

export { DEFAULT_METADATA_SOURCES };
