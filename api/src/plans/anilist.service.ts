import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import type { AniListAnime, AniListResponse } from './anilist.types';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const MAX_ATTEMPTS = 5;

const MEDIA_QUERY = `
query ($idMal: Int, $id: Int) {
  Media(idMal: $idMal, id: $id, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    genres
    averageScore
    meanScore
    popularity
    episodes
    status
    season
    seasonYear
    startDate { year month day }
    endDate { year month day }
    coverImage {
      extraLarge
      large
    }
    nextAiringEpisode {
      id
      episode
      airingAt
    }
    siteUrl
    studios(isMain: true) {
      nodes { name }
    }
    tags {
      name
      rank
    }
  }
}
`;

@Injectable()
export class AniListService {
  private readonly logger = new Logger(AniListService.name);

  private readonly minIntervalMs = 700;
  private lastRequestAt = 0;

  private rateLimitedUntil = 0;
  private consecutiveRateLimits = 0;
  private totalRateLimits = 0;

  // FIFO promise-chain queue — concurrency = 1
  private queue: Promise<void> = Promise.resolve();

  async fetchByMalId(malId: number): Promise<AniListAnime | null> {
    return this.queryMedia({ idMal: malId });
  }

  async fetchByAniListId(anilistId: number): Promise<AniListAnime | null> {
    return this.queryMedia({ id: anilistId });
  }

  private queryMedia(variables: { idMal?: number; id?: number }): Promise<AniListAnime | null> {
    const result = this.queue.then(() => this.executeQuery(variables));
    // Swallow rejections so the chain never stalls on a failed task
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async executeQuery(variables: { idMal?: number; id?: number }): Promise<AniListAnime | null> {
    const id = variables.idMal ?? variables.id;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Wait out any active rate-limit back-off
      const now = Date.now();
      if (now < this.rateLimitedUntil) {
        const waitMs = this.rateLimitedUntil - now;
        await this.sleep(waitMs);
        this.logger.log('AniList back-off lifted, resuming queue');
        this.rateLimitedUntil = 0;
      }

      // Enforce minimum inter-request interval
      const elapsed = Date.now() - this.lastRequestAt;
      if (elapsed < this.minIntervalMs) {
        await this.sleep(this.minIntervalMs - elapsed);
      }
      this.lastRequestAt = Date.now();

      try {
        const response = await axios.post<AniListResponse>(
          ANILIST_GRAPHQL_URL,
          { query: MEDIA_QUERY, variables },
          {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            timeout: 12_000,
          },
        );

        const media = response.data?.data?.Media ?? null;
        this.consecutiveRateLimits = 0;
        return media;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 404) {
            return null;
          }

          if (status === 429) {
            const delay = this.getRetryDelayMs(error);
            this.rateLimitedUntil = Date.now() + delay;
            this.consecutiveRateLimits++;
            this.totalRateLimits++;
            const resumeAt = new Date(this.rateLimitedUntil).toISOString();
            this.logger.warn(
              `AniList rate limited (429) for id=${id}: ` +
                `consecutiveRateLimits=${this.consecutiveRateLimits}, totalRateLimits=${this.totalRateLimits}, ` +
                `retryDelay=${delay}ms, estimatedResume=${resumeAt}`,
            );

            if (attempt < MAX_ATTEMPTS - 1) {
              continue;
            }
          } else {
            // Network / server error — exponential back-off
            const backoff = 1000 * Math.pow(2, attempt);
            this.logger.warn(
              `AniList request error for id=${id} (attempt ${attempt + 1}/${MAX_ATTEMPTS}): ${String(error)}`,
            );
            if (attempt < MAX_ATTEMPTS - 1) {
              await this.sleep(backoff);
              continue;
            }
          }
        } else {
          // Non-axios error — log and fall through to final failure
          this.logger.warn(`AniList unexpected error for id=${id}: ${String(error)}`);
        }
      }
    }

    this.logger.warn(`AniList: all ${MAX_ATTEMPTS} attempts exhausted for id=${id}, giving up`);
    return null;
  }

  private getRetryDelayMs(error: unknown): number {
    if (!axios.isAxiosError(error)) return 60_000;

    const retryAfter = error.response?.headers?.['retry-after'];
    const retryAfterValue: string | undefined = Array.isArray(retryAfter) ? retryAfter[0] : retryAfter;

    if (typeof retryAfterValue === 'string' && retryAfterValue.length > 0) {
      // HTTP-date format: e.g. "Wed, 24 Jun 2026 14:00:00 GMT"
      const asDate = Date.parse(retryAfterValue);
      if (!isNaN(asDate)) {
        return Math.max(asDate - Date.now(), 0);
      }

      // Numeric seconds format: e.g. "60"
      const asSeconds = parseInt(retryAfterValue, 10);
      if (isFinite(asSeconds)) {
        return asSeconds * 1000;
      }
    }

    return 60_000;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }
}
