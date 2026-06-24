import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SimklMediaType, TitleTranslationSource } from './plans.enums';
import type { SimklEpisode, SimklIds, SimklRatings } from './simkl.types';
import type { EnrichmentSourceSnapshot } from './title-enrichment.types';

export interface MergedRatings {
  mal: number | null;
  shikimori: number | null;
  yani: number | null;
  simkl: number | null;
  imdb: number | null;
  anilist: number | null;
}

@Entity('media_titles')
@Index(['simklId', 'mediaType'], { unique: true, where: '"simklId" IS NOT NULL' })
@Index(['malId'], { unique: true, where: '"malId" IS NOT NULL' })
export class MediaTitleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  mediaType: SimklMediaType;

  @Column({ type: 'int', nullable: true })
  simklId: number | null;

  @Column({ type: 'int', nullable: true })
  malId: number | null;

  @Column({ type: 'int', nullable: true })
  anilistId: number | null;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  titleEn: string | null;

  @Column({ type: 'varchar', nullable: true })
  titleUa: string | null;

  @Column({ type: 'varchar', nullable: true })
  titleOriginal: string | null;

  @Column({ type: 'varchar', nullable: true })
  titleTranslationSource: TitleTranslationSource | null;

  @Column({ type: 'timestamptz', nullable: true })
  titleTranslatedAt: Date | null;

  @Column({ type: 'timestamptz' })
  airDate: Date;

  @Column({ type: 'date', nullable: true })
  releaseDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  posterPath: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'jsonb', nullable: true })
  ratings: SimklRatings | null;

  @Column({ type: 'jsonb', nullable: true })
  mergedRatings: MergedRatings | null;

  @Column({ type: 'jsonb', nullable: true })
  ids: SimklIds | null;

  @Column({ type: 'jsonb', nullable: true })
  episode: SimklEpisode | null;

  @Column({ type: 'jsonb', nullable: true })
  genres: string[] | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'varchar', nullable: true })
  airingStatus: string | null;

  @Column({ type: 'int', nullable: true })
  episodes: number | null;

  @Column({ type: 'boolean', nullable: true })
  hasUkrainianDub: boolean | null;

  @Column({ type: 'timestamptz', nullable: true })
  nextEpisodeAiringAt: Date | null;

  @Column({ type: 'int', nullable: true })
  nextEpisodeNumber: number | null;

  @Column({ type: 'jsonb', nullable: true })
  studios: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ type: 'int', nullable: true })
  popularity: number | null;

  @Column({ type: 'jsonb', nullable: true })
  fandubbers: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  fansubbers: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  sourceSnapshots: EnrichmentSourceSnapshot[] | null;

  @Column({ type: 'timestamptz', nullable: true })
  enrichedAt: Date | null;

  @Column({ type: 'timestamptz' })
  syncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
