import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { AniHubService } from './anihub.service';
import type { AniHubAnime } from './anihub.types';
import { AniListService } from './anilist.service';
import type { AniListAnime } from './anilist.types';
import { JikanService } from './jikan.service';
import { MediaTitleEntity } from './media-title.entity';
import { SimklMediaType } from './plans.enums';
import { ShikimoriService } from './shikimori.service';
import { TitleMergeService } from './title-merge.service';
import type { EnrichmentSourceId, EnrichmentSourceSnapshot } from './title-enrichment.types';
import { YaniService } from './yani.service';

export const DEFAULT_METADATA_SOURCES: EnrichmentSourceId[] = [
  'anilist',
  'jikan',
  'anihub',
  'shikimori',
  'yani',
];

@Injectable()
export class MediaMetadataService {
  private readonly logger = new Logger(MediaMetadataService.name);

  constructor(
    @InjectRepository(MediaTitleEntity)
    private readonly mediaTitleRepository: Repository<MediaTitleEntity>,
    private readonly jikanService: JikanService,
    private readonly anihubService: AniHubService,
    private readonly shikimoriService: ShikimoriService,
    private readonly yaniService: YaniService,
    private readonly anilistService: AniListService,
    private readonly titleMergeService: TitleMergeService,
  ) {}

  async syncAniHubSeasonal(limit = 50): Promise<number> {
    const seasonal = await this.anihubService.fetchSeasonal(limit);
    let upserted = 0;

    for (const entry of seasonal) {
      if (!entry.mal_id) {
        continue;
      }

      try {
        await this.upsertFromAniHub(entry);
        upserted++;
      } catch (error) {
        this.logger.warn(`Failed to upsert AniHub seasonal title mal=${entry.mal_id}: ${String(error)}`);
      }
    }

    return upserted;
  }

  async enrichTitle(
    item: MediaTitleEntity,
    metadataSources: EnrichmentSourceId[] = DEFAULT_METADATA_SOURCES,
  ): Promise<MediaTitleEntity> {
    const snapshots = await this.fetchSnapshots(item, metadataSources);
    const merged = this.titleMergeService.mergeSnapshots(item, snapshots);
    const updates = this.titleMergeService.buildPersistPayload(item, merged, snapshots);

    await this.mediaTitleRepository.save({ ...item, ...updates });
    return { ...item, ...updates };
  }

  async enrichAnimeBatch(
    items: MediaTitleEntity[],
    metadataSources: EnrichmentSourceId[] = DEFAULT_METADATA_SOURCES,
  ): Promise<number> {
    const eligible = items.filter((i) => i.mediaType === SimklMediaType.Anime && i.malId);
    const total = eligible.length;
    const startMs = Date.now();
    const nominalEstSec = Math.round((total * 700) / 1000);
    this.logger.log(
      `Starting AniList enrichment for ${total} items, estimated ~${nominalEstSec}s at nominal rate`,
    );

    let enriched = 0;
    let done = 0;
    let failed = 0;

    for (const item of items) {
      if (item.mediaType !== SimklMediaType.Anime || !item.malId) {
        continue;
      }

      try {
        await this.enrichTitle(item, metadataSources);
        enriched++;
      } catch (error) {
        failed++;
        this.logger.warn(`Metadata enrich failed for ${item.id}: ${String(error)}`);
      }

      done++;

      if (done % 10 === 0) {
        const elapsed = Math.round((Date.now() - startMs) / 1000);
        const eta = done < total ? Math.round((elapsed / done) * (total - done)) : 0;
        this.logger.log(
          `AniList enrichment progress: ${done}/${total} done, ${failed} failed, elapsed ${elapsed}s, ETA ${eta}s`,
        );
      }
    }

    const totalElapsed = Math.round((Date.now() - startMs) / 1000);
    this.logger.log(
      `AniList enrichment complete: ${enriched} enriched, ${failed} failed in ${totalElapsed}s`,
    );

    return enriched;
  }

  /**
   * Returns total enrichable anime titles and how many have been enriched,
   * so callers can log a coverage percentage.
   */
  async getEnrichmentStats(): Promise<{ total: number; enriched: number; coveragePct: number }> {
    const total = await this.mediaTitleRepository.count({
      where: { mediaType: SimklMediaType.Anime },
    });
    const enriched = await this.mediaTitleRepository.count({
      where: { mediaType: SimklMediaType.Anime, enrichedAt: LessThan(new Date()) },
    });
    const coveragePct = total > 0 ? Math.round((enriched / total) * 1000) / 10 : 0;
    return { total, enriched, coveragePct };
  }

  /**
   * Priority-queue enrichment:
   * 1. Titles with enrichedAt IS NULL (never enriched) come first.
   * 2. Then titles stale > 7 days, ordered oldest-first.
   * Caps at maxItems per run to stay within API rate limits.
   */
  async enrichNextBatch(
    maxItems = 500,
    metadataSources: EnrichmentSourceId[] = DEFAULT_METADATA_SOURCES,
  ): Promise<{ enriched: number; total: number; coveragePct: number }> {
    const staleCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Two-pass fetch: unenriched first, then stale — combined via TypeORM
    const unenriched = await this.mediaTitleRepository.find({
      where: { mediaType: SimklMediaType.Anime, enrichedAt: IsNull() },
      order: { airDate: 'DESC' },
      take: maxItems,
    });

    const remaining = maxItems - unenriched.length;
    const stale =
      remaining > 0
        ? await this.mediaTitleRepository.find({
            where: { mediaType: SimklMediaType.Anime, enrichedAt: LessThan(staleCutoff) },
            order: { enrichedAt: 'ASC' },
            take: remaining,
          })
        : [];

    const items = [...unenriched, ...stale];
    const startMs = Date.now();
    const nominalEstSec = Math.round((items.length * 700) / 1000);
    this.logger.log(
      `enrichNextBatch: ${unenriched.length} unenriched + ${stale.length} stale = ${items.length} items, est. ~${nominalEstSec}s`,
    );

    let enriched = 0;
    let failed = 0;

    for (const item of items) {
      if (!item.malId) continue;

      try {
        await this.enrichTitle(item, metadataSources);
        enriched++;
      } catch (error) {
        failed++;
        this.logger.warn(`enrichNextBatch: failed for ${item.id}: ${String(error)}`);
      }

      const done = enriched + failed;
      if (done % 20 === 0) {
        const elapsed = Math.round((Date.now() - startMs) / 1000);
        const eta = done < items.length ? Math.round((elapsed / done) * (items.length - done)) : 0;
        this.logger.log(
          `enrichNextBatch progress: ${done}/${items.length} done, ${failed} failed, elapsed ${elapsed}s, ETA ${eta}s`,
        );
      }
    }

    const totalElapsed = Math.round((Date.now() - startMs) / 1000);
    this.logger.log(
      `enrichNextBatch complete: ${enriched} enriched, ${failed} failed in ${totalElapsed}s`,
    );

    const stats = await this.getEnrichmentStats();
    return { enriched, total: stats.total, coveragePct: stats.coveragePct };
  }

  async fetchSnapshots(
    item: MediaTitleEntity,
    metadataSources: EnrichmentSourceId[],
  ): Promise<EnrichmentSourceSnapshot[]> {
    const sources = new Set(metadataSources);
    const snapshots: EnrichmentSourceSnapshot[] = [this.titleMergeService.buildSimklSnapshot(item)];

    const malId = item.malId ?? item.ids?.mal ?? null;
    const anilistId = item.anilistId ?? item.ids?.anilist ?? null;
    const isAnime = item.mediaType === SimklMediaType.Anime;

    if (!isAnime || (!malId && !anilistId)) {
      for (const source of DEFAULT_METADATA_SOURCES) {
        if (sources.has(source)) {
          snapshots.push({
            source,
            status: 'skipped',
            fields: {},
            error: 'Anime metadata sources require an anime item with a MAL ID or AniList ID.',
          });
        }
      }
      return snapshots;
    }

    const [anilistResult, jikanResult, anihubResult, shikimoriResult, yaniResult] = await Promise.all([
      sources.has('anilist')
        ? (malId
            ? this.anilistService.fetchByMalId(malId)
            : this.anilistService.fetchByAniListId(anilistId!))
        : null,
      sources.has('jikan') && malId ? this.jikanService.fetchAnimeDetails(malId) : null,
      sources.has('anihub') && malId ? this.anihubService.fetchByMalId(malId) : null,
      sources.has('shikimori') && malId ? this.shikimoriService.fetchByMalId(malId) : null,
      sources.has('yani') && malId ? this.yaniService.fetchByMalId(malId) : null,
    ]);

    if (sources.has('anilist')) {
      snapshots.push(this.buildAniListSnapshot(anilistResult));

      if (anilistResult) {
        await this.persistAniListDiscoveries(item, anilistResult);
      }
    }

    if (sources.has('jikan')) {
      const hasData = jikanResult && (jikanResult.titleEn || jikanResult.genres.length || jikanResult.score !== null);
      snapshots.push(
        hasData
          ? {
              source: 'jikan',
              status: 'ok',
              fields: {
                titleEn: { value: jikanResult.titleEn },
                description: { value: jikanResult.synopsis },
                genres: { value: jikanResult.genres },
                rating: { value: jikanResult.score },
                episodes: { value: jikanResult.episodes },
                status: { value: jikanResult.status },
                airedFrom: { value: jikanResult.airedFrom },
              },
            }
          : { source: 'jikan', status: 'not_found', fields: {} },
      );
    }

    if (sources.has('anihub')) {
      snapshots.push(this.buildAniHubSnapshot(anihubResult));
    }

    if (sources.has('shikimori')) {
      snapshots.push(this.buildShikimoriSnapshot(shikimoriResult));
    }

    if (sources.has('yani')) {
      snapshots.push(this.buildYaniSnapshot(yaniResult));
    }

    return snapshots;
  }

  private async persistAniListDiscoveries(
    item: MediaTitleEntity,
    anilistResult: AniListAnime,
  ): Promise<void> {
    const updates: Partial<MediaTitleEntity> = {};

    if (!item.anilistId && anilistResult.id) {
      updates.anilistId = anilistResult.id;
    }

    const nextEpAt = anilistResult.nextAiringEpisode?.airingAt;
    if (nextEpAt) {
      updates.nextEpisodeAiringAt = new Date(nextEpAt * 1000);
    } else if (item.nextEpisodeAiringAt && anilistResult.status === 'FINISHED') {
      updates.nextEpisodeAiringAt = null;
    }

    if (!item.malId && anilistResult.idMal) {
      updates.malId = anilistResult.idMal;
    }

    if (Object.keys(updates).length > 0) {
      await this.mediaTitleRepository.save({ ...item, ...updates });
    }
  }

  private async upsertFromAniHub(entry: AniHubAnime): Promise<void> {
    if (!entry.mal_id) {
      return;
    }

    const syncedAt = new Date();
    const existing = await this.mediaTitleRepository.findOne({
      where: { malId: entry.mal_id },
    });

    const payload: Partial<MediaTitleEntity> = {
      mediaType: SimklMediaType.Anime,
      malId: entry.mal_id,
      slug: entry.slug,
      title: entry.title_original ?? entry.title_english ?? entry.title_ukrainian ?? `MAL ${entry.mal_id}`,
      titleEn: entry.title_english,
      titleUa: entry.title_ukrainian,
      titleOriginal: entry.title_original,
      airDate: existing?.airDate ?? syncedAt,
      posterPath: entry.poster_url ?? existing?.posterPath ?? null,
      sourceUrl: `https://anihub.in.ua/anime/${entry.slug}`,
      genres: entry.genres?.length ? entry.genres : (existing?.genres ?? null),
      description: entry.description ?? existing?.description ?? null,
      year: entry.year ?? existing?.year ?? null,
      airingStatus: entry.status ?? existing?.airingStatus ?? null,
      episodes: entry.episodes_count ?? existing?.episodes ?? null,
      hasUkrainianDub: entry.has_ukrainian_dub,
      syncedAt,
      simklId: existing?.simklId ?? null,
      ids: existing?.ids ?? null,
      ratings: existing?.ratings ?? null,
    };

    if (existing) {
      await this.mediaTitleRepository.save({ ...existing, ...payload });
      return;
    }

    await this.mediaTitleRepository.save(this.mediaTitleRepository.create(payload));
  }

  private buildAniListSnapshot(anilistResult: AniListAnime | null): EnrichmentSourceSnapshot {
    if (!anilistResult) {
      return { source: 'anilist', status: 'not_found', fields: {} };
    }

    const score = anilistResult.averageScore ?? anilistResult.meanScore ?? null;
    const rating = score !== null ? Math.round((score / 10) * 10) / 10 : null;

    const status = this.normalizeAniListStatus(anilistResult.status);
    const nextEpAt = anilistResult.nextAiringEpisode?.airingAt ?? null;

    return {
      source: 'anilist',
      status: 'ok',
      fields: {
        titleEn: { value: anilistResult.title.english },
        titleOriginal: { value: anilistResult.title.native },
        titleRomaji: { value: anilistResult.title.romaji },
        genres: { value: anilistResult.genres ?? [] },
        description: { value: anilistResult.description ? this.stripHtml(anilistResult.description) : null },
        rating: { value: rating },
        year: { value: anilistResult.seasonYear ?? anilistResult.startDate?.year ?? null },
        status: { value: status },
        episodes: { value: anilistResult.episodes },
        posterUrl: { value: anilistResult.coverImage?.extraLarge ?? anilistResult.coverImage?.large ?? null },
        nextEpisodeAiringAt: { value: nextEpAt ? new Date(nextEpAt * 1000).toISOString() : null },
        nextEpisodeNumber: { value: anilistResult.nextAiringEpisode?.episode ?? null },
        popularity: { value: anilistResult.popularity },
        studios: { value: anilistResult.studios?.nodes.map((s) => s.name) ?? [] },
        tags: { value: anilistResult.tags?.slice(0, 10).map((t) => t.name) ?? [] },
      },
      raw: {
        anilistId: anilistResult.id,
        malId: anilistResult.idMal,
        siteUrl: anilistResult.siteUrl,
        season: anilistResult.season,
        seasonYear: anilistResult.seasonYear,
      },
    };
  }

  private normalizeAniListStatus(status: AniListAnime['status']): string | null {
    switch (status) {
      case 'RELEASING': return 'ongoing';
      case 'FINISHED': return 'finished';
      case 'NOT_YET_RELEASED': return 'upcoming';
      case 'CANCELLED': return 'cancelled';
      case 'HIATUS': return 'hiatus';
      default: return null;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
  }

  private buildAniHubSnapshot(anihubResult: Awaited<ReturnType<AniHubService['fetchByMalId']>>): EnrichmentSourceSnapshot {
    if (!anihubResult) {
      return { source: 'anihub', status: 'not_found', fields: {} };
    }

    const dubbingStudios = anihubResult.dubbing_studios?.map((studio) => studio.name) ?? [];

    return {
      source: 'anihub',
      status: 'ok',
      fields: {
        titleUa: { value: anihubResult.title_ukrainian },
        titleEn: { value: anihubResult.title_english },
        titleOriginal: { value: anihubResult.title_original },
        genres: { value: anihubResult.genres ?? [] },
        hasUkrainianDub: { value: anihubResult.has_ukrainian_dub },
        rating: { value: anihubResult.rating },
        year: { value: anihubResult.year },
        status: { value: anihubResult.status },
        episodes: { value: anihubResult.episodes_count },
        description: { value: anihubResult.description },
        posterUrl: { value: anihubResult.poster_url },
        studios: { value: dubbingStudios },
      },
      raw: {
        slug: anihubResult.slug,
        dubbingStudios,
      },
    };
  }

  private buildShikimoriSnapshot(
    shikimoriResult: Awaited<ReturnType<ShikimoriService['fetchByMalId']>>,
  ): EnrichmentSourceSnapshot {
    if (!shikimoriResult) {
      return { source: 'shikimori', status: 'not_found', fields: {} };
    }

    return {
      source: 'shikimori',
      status: 'ok',
      fields: {
        titleOriginal: { value: shikimoriResult.name },
        titleRu: { value: shikimoriResult.russian },
        titleEn: { value: shikimoriResult.english },
        genres: {
          value:
            shikimoriResult.genres
              ?.map((genre) => genre.name)
              .filter((name): name is string => Boolean(name)) ?? [],
        },
        rating: { value: shikimoriResult.score },
        status: { value: shikimoriResult.status },
        kind: { value: shikimoriResult.kind },
        season: { value: shikimoriResult.season },
        posterUrl: { value: shikimoriResult.poster?.originalUrl ?? null },
        fandubbers: { value: shikimoriResult.fandubbers ?? [] },
        fansubbers: { value: shikimoriResult.fansubbers ?? [] },
      },
    };
  }

  private buildYaniSnapshot(
    yaniResult: Awaited<ReturnType<YaniService['fetchByMalId']>>,
  ): EnrichmentSourceSnapshot {
    if (!yaniResult) {
      return { source: 'yani', status: 'not_found', fields: {} };
    }

    return {
      source: 'yani',
      status: 'ok',
      fields: {
        titleUa: { value: yaniResult.title },
        description: { value: yaniResult.description ?? null },
        genres: {
          value: yaniResult.genres?.map((genre) => genre.title) ?? [],
        },
        rating: { value: yaniResult.rating?.average ?? null },
        malRating: { value: yaniResult.rating?.myanimelist_rating ?? null },
        shikimoriRating: { value: yaniResult.rating?.shikimori_rating ?? null },
        year: { value: yaniResult.year ?? null },
        status: { value: yaniResult.anime_status?.title ?? null },
        episodes: { value: null },
        posterUrl: { value: this.normalizeYaniPoster(yaniResult.poster) },
      },
      raw: {
        animeId: yaniResult.anime_id,
        animeUrl: yaniResult.anime_url,
        remoteIds: yaniResult.remote_ids,
      },
    };
  }

  private normalizeYaniPoster(poster?: { fullsize?: string; medium?: string }): string | null {
    const path = poster?.fullsize ?? poster?.medium;
    if (!path) {
      return null;
    }

    return path.startsWith('//') ? `https:${path}` : path;
  }
}
