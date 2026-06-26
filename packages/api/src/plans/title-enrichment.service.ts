import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AniListService } from './anilist.service';
import { JikanService } from './jikan.service';
import { MediaMetadataService, DEFAULT_METADATA_SOURCES } from './media-metadata.service';
import { MediaTitleEntity } from './media-title.entity';
import { buildPosterUrl } from './simkl.utils';
import { TitleMergeService } from './title-merge.service';
import type {
  EnrichmentSourceId,
  EnrichmentSourceSnapshot,
  MergedTitleDetail,
} from './title-enrichment.types';

export const DEFAULT_ENRICHMENT_SOURCES: EnrichmentSourceId[] = [
  'simkl',
  ...DEFAULT_METADATA_SOURCES,
];

@Injectable()
export class TitleEnrichmentService {
  private readonly logger = new Logger(TitleEnrichmentService.name);

  constructor(
    @InjectRepository(MediaTitleEntity)
    private readonly mediaTitleRepository: Repository<MediaTitleEntity>,
    private readonly mediaMetadataService: MediaMetadataService,
    private readonly titleMergeService: TitleMergeService,
    private readonly jikanService: JikanService,
    private readonly anilistService: AniListService,
  ) {}

  async getTitleDetail(
    titleId: string,
    requestedSources: EnrichmentSourceId[] = DEFAULT_ENRICHMENT_SOURCES,
  ): Promise<{
    item: ReturnType<TitleEnrichmentService['mapBaseItem']>;
    merged: MergedTitleDetail;
    sources: EnrichmentSourceSnapshot[];
  }> {
    const item = await this.mediaTitleRepository.findOne({ where: { id: titleId } });

    if (!item) {
      throw new NotFoundException('Title not found');
    }

    const metadataSources = requestedSources.filter(
      (source): source is EnrichmentSourceId => source !== 'simkl',
    );

    const enriched = await this.mediaMetadataService.enrichTitle(item, metadataSources);
    const snapshots =
      enriched.sourceSnapshots ??
      (await this.mediaMetadataService.fetchSnapshots(enriched, metadataSources));
    const merged = this.titleMergeService.mergeSnapshots(enriched, snapshots);

    if (!merged.description) {
      merged.description = await this.fetchDescriptionFallback(enriched);
    }

    this.logger.debug(`Expanded title detail for ${titleId} from ${snapshots.length} source(s).`);

    return {
      item: this.mapBaseItem(enriched),
      merged,
      sources: snapshots,
    };
  }

  private async fetchDescriptionFallback(item: MediaTitleEntity): Promise<string | null> {
    const malId = item.malId ?? item.ids?.mal ?? null;
    const anilistId = item.anilistId ?? null;

    const candidates: Promise<string | null>[] = [];

    if (malId) {
      candidates.push(this.jikanService.fetchSynopsis(malId));
    }

    if (anilistId) {
      candidates.push(
        this.anilistService
          .fetchByAniListId(anilistId)
          .then((r) => r?.description?.trim() ?? null)
          .catch(() => null),
      );
    } else if (malId) {
      candidates.push(
        this.anilistService
          .fetchByMalId(malId)
          .then((r) => r?.description?.trim() ?? null)
          .catch(() => null),
      );
    }

    if (candidates.length === 0) {
      return null;
    }

    try {
      const description = await Promise.any(
        candidates.map((p) =>
          p.then((v) => {
            if (!v) throw new Error('no description');
            return v;
          }),
        ),
      );
      this.logger.debug(`Fetched fallback description for ${item.id}`);
      return description;
    } catch {
      return null;
    }
  }

  private mapBaseItem(item: MediaTitleEntity) {
    return {
      id: item.id,
      mediaType: item.mediaType,
      simklId: item.simklId,
      malId: item.malId,
      anilistId: item.anilistId ?? null,
      slug: item.slug,
      title: item.title,
      titleEn: item.titleEn,
      titleUa: item.titleUa,
      titleOriginal: item.titleOriginal,
      titleTranslationSource: item.titleTranslationSource,
      airDate: item.airDate.toISOString(),
      releaseDate: item.releaseDate,
      posterUrl: buildPosterUrl(item.posterPath),
      sourceUrl: item.sourceUrl,
      rank: item.rank,
      ratings: item.ratings,
      mergedRatings: item.mergedRatings,
      ids: item.ids,
      episode: item.episode,
      genres: item.genres,
      description: item.description,
      year: item.year,
      airingStatus: item.airingStatus,
      episodes: item.episodes,
      hasUkrainianDub: item.hasUkrainianDub,
      nextEpisodeAiringAt: item.nextEpisodeAiringAt?.toISOString() ?? null,
      syncedAt: item.syncedAt.toISOString(),
      enrichedAt: item.enrichedAt?.toISOString() ?? null,
    };
  }
}
