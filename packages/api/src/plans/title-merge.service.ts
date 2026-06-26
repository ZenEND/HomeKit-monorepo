import { Injectable } from '@nestjs/common';
import { MediaTitleEntity } from './media-title.entity';
import { buildPosterUrl } from './simkl.utils';
import type {
  EnrichmentSourceId,
  EnrichmentSourceSnapshot,
  MergedTitleDetail,
} from './title-enrichment.types';

@Injectable()
export class TitleMergeService {
  buildSimklSnapshot(item: MediaTitleEntity): EnrichmentSourceSnapshot {
    return {
      source: 'simkl',
      status: 'ok',
      fields: {
        title: { value: item.title },
        titleEn: { value: item.titleEn },
        titleUa: { value: item.titleUa },
        genres: { value: item.genres ?? [] },
        ratingMal: { value: item.ratings?.mal?.rating ?? null },
        ratingSimkl: { value: item.ratings?.simkl?.rating ?? null },
        ratingImdb: { value: item.ratings?.imdb?.rating ?? null },
        airDate: { value: item.airDate.toISOString() },
        posterUrl: { value: buildPosterUrl(item.posterPath) },
        rank: { value: item.rank },
      },
      raw: {
        simklId: item.simklId,
        slug: item.slug,
        sourceUrl: item.sourceUrl,
        ids: item.ids,
      },
    };
  }

  mergeSnapshots(item: MediaTitleEntity, snapshots: EnrichmentSourceSnapshot[]): MergedTitleDetail {
    const bySource = Object.fromEntries(snapshots.map((snapshot) => [snapshot.source, snapshot])) as Record<
      EnrichmentSourceId,
      EnrichmentSourceSnapshot
    >;

    const pickString = (...values: Array<string | null | undefined>): string | null => {
      for (const value of values) {
        const trimmed = value?.trim();
        if (trimmed) {
          return trimmed;
        }
      }
      return null;
    };

    const pickGenres = (...lists: Array<string[] | null | undefined>): string[] => {
      for (const list of lists) {
        if (list?.length) {
          return [...new Set(list.map((genre) => genre.trim()).filter(Boolean))];
        }
      }
      return [];
    };

    const titleUa = pickString(
      this.fieldString(bySource.anihub, 'titleUa'),
      this.fieldString(bySource.yani, 'titleUa'),
      this.fieldString(bySource.simkl, 'titleUa'),
      item.titleUa,
      this.fieldString(bySource.shikimori, 'titleRu'),
    );

    const titleEn = pickString(
      this.fieldString(bySource.anihub, 'titleEn'),
      this.fieldString(bySource.anilist, 'titleEn'),
      this.fieldString(bySource.jikan, 'titleEn'),
      this.fieldString(bySource.shikimori, 'titleEn'),
      this.fieldString(bySource.simkl, 'titleEn'),
      item.titleEn,
      item.title,
    );

    const titleOriginal = pickString(
      this.fieldString(bySource.anihub, 'titleOriginal'),
      this.fieldString(bySource.anilist, 'titleOriginal'),
      this.fieldString(bySource.shikimori, 'titleOriginal'),
      item.titleOriginal,
      this.fieldString(bySource.anilist, 'titleRomaji'),
      item.title,
    );

    const posterUrl = pickString(
      this.fieldString(bySource.shikimori, 'posterUrl'),
      this.fieldString(bySource.anihub, 'posterUrl'),
      this.fieldString(bySource.anilist, 'posterUrl'),
      this.fieldString(bySource.yani, 'posterUrl'),
      this.fieldString(bySource.simkl, 'posterUrl'),
      buildPosterUrl(item.posterPath),
    );

    const genres = pickGenres(
      this.fieldStringArray(bySource.jikan, 'genres'),
      this.fieldStringArray(bySource.anilist, 'genres'),
      this.fieldStringArray(bySource.shikimori, 'genres'),
      this.fieldStringArray(bySource.anihub, 'genres'),
      this.fieldStringArray(bySource.yani, 'genres'),
      item.genres,
    );

    const externalLinks: MergedTitleDetail['externalLinks'] = [];

    if (item.sourceUrl) {
      externalLinks.push({ label: 'Simkl', url: item.sourceUrl });
    }

    const malId = item.malId ?? item.ids?.mal ?? null;
    if (malId) {
      externalLinks.push({
        label: 'MyAnimeList',
        url: `https://myanimelist.net/anime/${malId}`,
      });
      externalLinks.push({
        label: 'Shikimori',
        url: `https://shikimori.one/animes/${malId}`,
      });
    }

    const anihubSlug = bySource.anihub?.raw?.slug;
    if (typeof anihubSlug === 'string') {
      externalLinks.push({
        label: 'AniHub',
        url: `https://anihub.in.ua/anime/${anihubSlug}`,
      });
    }

    const yaniUrl = bySource.yani?.raw?.animeUrl;
    if (typeof yaniUrl === 'string') {
      externalLinks.push({
        label: 'YummyAnime',
        url: `https://yani.tv/anime/${yaniUrl}`,
      });
    }

    const anilistSiteUrl = bySource.anilist?.raw?.siteUrl;
    if (typeof anilistSiteUrl === 'string') {
      externalLinks.push({ label: 'AniList', url: anilistSiteUrl });
    }

    return {
      title: titleOriginal ?? item.title,
      titleEn,
      titleUa,
      titleOriginal,
      description: pickString(
        this.fieldString(bySource.yani, 'description'),
        this.fieldString(bySource.anihub, 'description'),
        this.fieldString(bySource.anilist, 'description'),
        item.description,
      ),
      posterUrl,
      genres,
      ratings: {
        mal:
          this.fieldNumber(bySource.jikan, 'rating') ??
          this.fieldNumber(bySource.yani, 'malRating') ??
          item.ratings?.mal?.rating ??
          item.mergedRatings?.mal ??
          null,
        shikimori:
          this.fieldNumber(bySource.shikimori, 'rating') ??
          this.fieldNumber(bySource.yani, 'shikimoriRating') ??
          item.mergedRatings?.shikimori ??
          null,
        yani: this.fieldNumber(bySource.yani, 'rating') ?? item.mergedRatings?.yani ?? null,
        simkl: item.ratings?.simkl?.rating ?? item.mergedRatings?.simkl ?? null,
        imdb: item.ratings?.imdb?.rating ?? item.mergedRatings?.imdb ?? null,
        anilist: this.fieldNumber(bySource.anilist, 'rating') ?? item.mergedRatings?.anilist ?? null,
      },
      hasUkrainianDub:
        this.fieldBoolean(bySource.anihub, 'hasUkrainianDub') ?? item.hasUkrainianDub ?? null,
      year:
        this.fieldNumber(bySource.anihub, 'year') ??
        this.fieldNumber(bySource.anilist, 'year') ??
        this.fieldNumber(bySource.yani, 'year') ??
        item.year ??
        null,
      status:
        pickString(
          this.fieldString(bySource.anihub, 'status'),
          this.fieldString(bySource.anilist, 'status'),
          this.fieldString(bySource.shikimori, 'status'),
          this.fieldString(bySource.yani, 'status'),
          item.airingStatus,
        ) ?? null,
      episodes:
        this.fieldNumber(bySource.anihub, 'episodes') ??
        this.fieldNumber(bySource.anilist, 'episodes') ??
        this.fieldNumber(bySource.jikan, 'episodes') ??
        item.episodes ??
        null,
      externalLinks,
      // Rich metadata fields from AniList, Shikimori, AniHub
      studios:
        this.fieldStringArray(bySource.anilist, 'studios')?.filter(Boolean) ??
        this.fieldStringArray(bySource.anihub, 'studios')?.filter(Boolean) ??
        null,
      tags: this.fieldStringArray(bySource.anilist, 'tags')?.filter(Boolean) ?? null,
      popularity: this.fieldNumber(bySource.anilist, 'popularity') ?? null,
      nextEpisodeNumber: this.fieldNumber(bySource.anilist, 'nextEpisodeNumber') ?? null,
      fandubbers: this.fieldStringArray(bySource.shikimori, 'fandubbers')?.filter(Boolean) ?? null,
      fansubbers: this.fieldStringArray(bySource.shikimori, 'fansubbers')?.filter(Boolean) ?? null,
    };
  }

  buildPersistPayload(
    item: MediaTitleEntity,
    merged: MergedTitleDetail,
    snapshots: EnrichmentSourceSnapshot[],
  ): Partial<MediaTitleEntity> {
    const updates: Partial<MediaTitleEntity> = {
      sourceSnapshots: snapshots,
      enrichedAt: new Date(),
      // Always refresh derived/aggregated fields — never guard with null check
      mergedRatings: merged.ratings,
    };

    // User-correctable text fields: only write when the entity is still blank
    // to preserve any manually-set or previously-translated value.
    if (merged.titleUa && !item.titleUa) {
      updates.titleUa = merged.titleUa;
    }
    if (merged.titleEn && !item.titleEn) {
      updates.titleEn = merged.titleEn;
    }
    if (merged.titleOriginal && !item.titleOriginal) {
      updates.titleOriginal = merged.titleOriginal;
    }

    // Always refresh metadata so stale values from the first sync get updated
    if (merged.genres.length > 0) {
      updates.genres = merged.genres;
    }
    if (merged.description) {
      updates.description = merged.description;
    }
    if (merged.posterUrl) {
      updates.posterPath = merged.posterUrl;
    }
    if (merged.year !== null) {
      updates.year = merged.year;
    }
    if (merged.status) {
      updates.airingStatus = merged.status;
    }
    if (merged.episodes !== null) {
      updates.episodes = merged.episodes;
    }
    if (merged.hasUkrainianDub !== null) {
      updates.hasUkrainianDub = merged.hasUkrainianDub;
    }

    // Rich enrichment fields — always overwrite unconditionally
    updates.studios = merged.studios ?? null;
    updates.tags = merged.tags ?? null;
    updates.popularity = merged.popularity ?? null;
    updates.nextEpisodeNumber = merged.nextEpisodeNumber ?? null;
    updates.fandubbers = merged.fandubbers ?? null;
    updates.fansubbers = merged.fansubbers ?? null;

    return updates;
  }

  private fieldString(snapshot: EnrichmentSourceSnapshot | undefined, key: string): string | null {
    const value = snapshot?.fields[key]?.value;
    return typeof value === 'string' ? value : null;
  }

  private fieldNumber(snapshot: EnrichmentSourceSnapshot | undefined, key: string): number | null {
    const value = snapshot?.fields[key]?.value;
    return typeof value === 'number' ? value : null;
  }

  private fieldBoolean(snapshot: EnrichmentSourceSnapshot | undefined, key: string): boolean | null {
    const value = snapshot?.fields[key]?.value;
    return typeof value === 'boolean' ? value : null;
  }

  private fieldStringArray(
    snapshot: EnrichmentSourceSnapshot | undefined,
    key: string,
  ): string[] | null {
    const value = snapshot?.fields[key]?.value;
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : null;
  }
}
