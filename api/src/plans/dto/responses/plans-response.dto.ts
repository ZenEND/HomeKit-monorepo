import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PlanActivityType,
  PlanStatus,
  SimklMediaType,
  TitleTranslationSource,
} from '../../plans.enums';
import type { SimklEpisode, SimklIds, SimklRatings } from '../../simkl.types';

export class SimklRatingValueDto {
  @ApiProperty({ example: 8.4 })
  rating: number;

  @ApiProperty({ example: 15234 })
  votes: number;
}

export class SimklRatingsDto implements SimklRatings {
  @ApiPropertyOptional({ type: SimklRatingValueDto })
  simkl?: SimklRatingValueDto;

  @ApiPropertyOptional({ type: SimklRatingValueDto })
  imdb?: SimklRatingValueDto;

  @ApiPropertyOptional({ type: SimklRatingValueDto })
  mal?: SimklRatingValueDto;
}

export class SimklIdsDto implements SimklIds {
  @ApiProperty({ example: 1520136 })
  simkl_id: number;

  @ApiProperty({ example: 'ruin-road' })
  slug: string;

  @ApiPropertyOptional({ example: 'tt12345678' })
  imdb?: string;

  @ApiPropertyOptional({ example: '204821' })
  tmdb?: string;

  @ApiPropertyOptional({ example: '418273' })
  tvdb?: string;

  @ApiPropertyOptional({ example: 5114 })
  mal?: number;
}

export class SimklEpisodeDto implements SimklEpisode {
  @ApiProperty({ example: 2 })
  season: number;

  @ApiProperty({ example: 7 })
  episode: number;

  @ApiPropertyOptional({ example: 'https://simkl.com/tv/1520136/ruin-road/season-2/episode-7' })
  url?: string;
}

export class MergedRatingsDto {
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

  @ApiPropertyOptional({ nullable: true })
  anilist: number | null;
}

export class CalendarItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: SimklMediaType, example: SimklMediaType.Anime })
  mediaType: SimklMediaType;

  @ApiPropertyOptional({ example: 1520136, nullable: true })
  simklId: number | null;

  @ApiPropertyOptional({ example: 5114, nullable: true })
  malId: number | null;

  @ApiPropertyOptional({ example: 1735, nullable: true })
  anilistId: number | null;

  @ApiProperty({ example: 'ruin-road' })
  slug: string;

  @ApiProperty({ example: 'Ruin Road' })
  title: string;

  @ApiPropertyOptional({ example: 'Ruin Road' })
  titleEn: string | null;

  @ApiPropertyOptional({ example: 'Шлях руїн' })
  titleUa: string | null;

  @ApiPropertyOptional({ example: 'Ruin Road' })
  titleOriginal: string | null;

  @ApiPropertyOptional({ enum: TitleTranslationSource })
  titleTranslationSource: TitleTranslationSource | null;

  @ApiProperty({ format: 'date-time' })
  airDate: string;

  @ApiPropertyOptional({ format: 'date', example: '2016-10-15' })
  releaseDate: string | null;

  @ApiProperty({ example: 'https://wsrv.nl/?url=https://simkl.in/posters/94/941b16f3a4d2f5e0c8_w.webp&q=90' })
  posterUrl: string;

  @ApiPropertyOptional({ example: 'https://simkl.com/tv/1520136/ruin-road', nullable: true })
  sourceUrl: string | null;

  @ApiPropertyOptional({ example: 42 })
  rank: number | null;

  @ApiPropertyOptional({ type: SimklRatingsDto })
  ratings: SimklRatingsDto | null;

  @ApiPropertyOptional({ type: MergedRatingsDto })
  mergedRatings: MergedRatingsDto | null;

  @ApiPropertyOptional({ type: SimklIdsDto })
  ids: SimklIdsDto | null;

  @ApiPropertyOptional({ type: SimklEpisodeDto })
  episode: SimklEpisodeDto | null;

  @ApiPropertyOptional({
    type: [String],
    example: ['Action', 'Comedy'],
  })
  genres: string[] | null;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  year: number | null;

  @ApiPropertyOptional({ nullable: true })
  airingStatus: string | null;

  @ApiPropertyOptional({ nullable: true })
  episodes: number | null;

  @ApiPropertyOptional({ nullable: true })
  hasUkrainianDub: boolean | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  nextEpisodeAiringAt: string | null;

  @ApiProperty({ format: 'date-time' })
  syncedAt: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  enrichedAt: string | null;
}

export class CalendarListResponseDto {
  @ApiProperty({ type: [CalendarItemResponseDto] })
  items: CalendarItemResponseDto[];

  @ApiPropertyOptional({ format: 'date-time' })
  lastSyncedAt: string | null;

  @ApiProperty({ example: 128 })
  total: number;
}

export class CalendarRefreshResponseDto {
  @ApiProperty({ description: 'Number of items synced across selected feeds.', example: 256 })
  synced: number;

  @ApiProperty({
    description: 'Number of titles translated to Ukrainian during this refresh.',
    example: 42,
  })
  translated: number;

  @ApiProperty({ format: 'date-time' })
  lastSyncedAt: string;

  @ApiProperty({
    description: 'Per-feed sync counts. Zero means the feed failed (see sourceErrors).',
    example: { anime: 120, tv: 96, movie: 40 },
  })
  bySource: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Error messages for feeds that failed to sync.',
    example: { tv: 'Request timeout after 30000ms' },
  })
  sourceErrors?: Record<string, string>;
}

export class PlanResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: PlanActivityType, example: PlanActivityType.Watching })
  activityType: PlanActivityType;

  @ApiProperty({ example: 'Ruin Road' })
  title: string;

  @ApiPropertyOptional({ example: 'Ruin Road' })
  titleEn: string | null;

  @ApiPropertyOptional({ example: 'Шлях руїн' })
  titleUa: string | null;

  @ApiProperty()
  posterUrl: string;

  @ApiPropertyOptional({ format: 'date-time' })
  plannedDate: string | null;

  @ApiPropertyOptional({ example: 'Watch with friends.' })
  notes: string | null;

  @ApiProperty({ enum: PlanStatus, example: PlanStatus.Planned })
  status: PlanStatus;

  @ApiPropertyOptional({ example: 'https://simkl.com/tv/1520136/ruin-road' })
  sourceUrl: string | null;

  @ApiPropertyOptional({ enum: SimklMediaType, example: SimklMediaType.Anime })
  mediaType: SimklMediaType | null;

  @ApiPropertyOptional({ type: SimklEpisodeDto })
  episode: SimklEpisodeDto | null;

  @ApiPropertyOptional({ format: 'uuid' })
  calendarItemId: string | null;

  @ApiPropertyOptional({
    description: 'Activity-specific metadata.',
    example: { ideaId: 'f1-watch-party' },
  })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
