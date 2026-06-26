import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarItemResponseDto } from './plans-response.dto';

export class EnrichmentFieldValueDto {
  @ApiPropertyOptional({ nullable: true })
  value: string | number | boolean | string[] | null;

  @ApiPropertyOptional()
  label?: string;
}

export class EnrichmentSourceSnapshotDto {
  @ApiProperty({ example: 'anihub' })
  source: string;

  @ApiProperty({ enum: ['ok', 'error', 'skipped', 'not_found'] })
  status: string;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'object' } })
  fields: Record<string, EnrichmentFieldValueDto>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  raw?: Record<string, unknown>;
}

export class MergedTitleRatingsDto {
  @ApiPropertyOptional({ nullable: true })
  mal: number | null;

  @ApiPropertyOptional({ nullable: true })
  shikimori: number | null;

  @ApiPropertyOptional({ nullable: true })
  yani: number | null;

  @ApiPropertyOptional({ nullable: true })
  simkl: number | null;

  @ApiPropertyOptional({ nullable: true })
  imdb: number | null;
}

export class ExternalLinkDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  url: string;
}

export class MergedTitleDetailDto {
  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  titleEn: string | null;

  @ApiPropertyOptional({ nullable: true })
  titleUa: string | null;

  @ApiPropertyOptional({ nullable: true })
  titleOriginal: string | null;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  posterUrl: string | null;

  @ApiProperty({ type: [String] })
  genres: string[];

  @ApiProperty({ type: MergedTitleRatingsDto })
  ratings: MergedTitleRatingsDto;

  @ApiPropertyOptional({ nullable: true })
  hasUkrainianDub: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  year: number | null;

  @ApiPropertyOptional({ nullable: true })
  status: string | null;

  @ApiPropertyOptional({ nullable: true })
  episodes: number | null;

  @ApiProperty({ type: [ExternalLinkDto] })
  externalLinks: ExternalLinkDto[];
}

export class TitleDetailResponseDto {
  @ApiProperty({ type: CalendarItemResponseDto })
  item: CalendarItemResponseDto;

  @ApiProperty({ type: MergedTitleDetailDto })
  merged: MergedTitleDetailDto;

  @ApiProperty({ type: [EnrichmentSourceSnapshotDto] })
  sources: EnrichmentSourceSnapshotDto[];
}
