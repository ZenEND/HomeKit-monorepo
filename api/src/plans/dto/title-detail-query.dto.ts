import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional } from 'class-validator';
import type { EnrichmentSourceId } from '../title-enrichment.types';
import { DEFAULT_ENRICHMENT_SOURCES } from '../title-enrichment.service';

const ENRICHMENT_SOURCES: EnrichmentSourceId[] = [
  'simkl',
  'jikan',
  'anihub',
  'shikimori',
  'yani',
];

function parseEnrichmentSources(value: unknown): EnrichmentSourceId[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  const sources = rawValues
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry): entry is EnrichmentSourceId =>
      ENRICHMENT_SOURCES.includes(entry as EnrichmentSourceId),
    );

  return sources.length > 0 ? [...new Set(sources)] : undefined;
}

export class TitleDetailQueryDto {
  @ApiPropertyOptional({
    description:
      'Metadata sources to refresh when opening a title. Defaults to all supported providers. Cached merged data is always returned.',
    example: 'simkl,jikan,anihub,shikimori,yani',
    isArray: true,
    enum: ENRICHMENT_SOURCES,
  })
  @IsOptional()
  @Transform(({ value }) => parseEnrichmentSources(value))
  @IsArray()
  @IsIn(ENRICHMENT_SOURCES, { each: true })
  sources?: EnrichmentSourceId[];
}

export { DEFAULT_ENRICHMENT_SOURCES };
