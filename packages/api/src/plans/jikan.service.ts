import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface JikanAnimeDetails {
  titleEn: string | null;
  synopsis: string | null;
  genres: string[];
  score: number | null;
  episodes: number | null;
  status: string | null;
  airedFrom: string | null;
}

interface JikanAnimeResponse {
  data?: {
    title?: string;
    title_english?: string | null;
    title_japanese?: string | null;
    synopsis?: string | null;
    genres?: Array<{ name?: string }>;
    score?: number | null;
    episodes?: number | null;
    status?: string | null;
    aired?: {
      from?: string | null;
    };
  };
}

@Injectable()
export class JikanService {
  private readonly logger = new Logger(JikanService.name);
  private lastRequestAt = 0;
  private readonly minIntervalMs = 1100;

  async fetchAnimeDetails(malId: number): Promise<JikanAnimeDetails> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.throttle();

      try {
        const response = await axios.get<JikanAnimeResponse>(
          `https://api.jikan.moe/v4/anime/${malId}`,
          { timeout: 10_000 },
        );

        const data = response.data?.data;
        const english = data?.title_english?.trim();
        const titleEn = english || data?.title?.trim() || null;
        const synopsis = data?.synopsis?.trim() || null;
        const genres =
          data?.genres
            ?.map((genre) => genre.name?.trim())
            .filter((name): name is string => Boolean(name)) ?? [];
        const score = typeof data?.score === 'number' ? data.score : null;
        const episodes = typeof data?.episodes === 'number' ? data.episodes : null;
        const status = data?.status?.trim() || null;
        const airedFrom = data?.aired?.from?.trim() || null;

        return { titleEn, synopsis, genres, score, episodes, status, airedFrom };
      } catch (error) {
        if (attempt === 0 && this.isRateLimitError(error)) {
          await this.sleep(this.getRetryDelayMs(error));
          continue;
        }

        this.logger.warn(`Jikan lookup failed for MAL ${malId}: ${String(error)}`);
        return { titleEn: null, synopsis: null, genres: [], score: null, episodes: null, status: null, airedFrom: null };
      }
    }

    return { titleEn: null, synopsis: null, genres: [], score: null, episodes: null, status: null, airedFrom: null };
  }

  async fetchEnglishTitle(malId: number): Promise<string | null> {
    const details = await this.fetchAnimeDetails(malId);
    return details.titleEn;
  }

  async fetchSynopsis(malId: number): Promise<string | null> {
    const details = await this.fetchAnimeDetails(malId);
    return details.synopsis;
  }

  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < this.minIntervalMs) {
      await this.sleep(this.minIntervalMs - elapsed);
    }
    this.lastRequestAt = Date.now();
  }

  private isRateLimitError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 429;
  }

  private getRetryDelayMs(error: unknown): number {
    if (!axios.isAxiosError(error)) {
      return 2000;
    }

    const retryAfter = error.response?.headers?.['retry-after'];
    const retryAfterValue = Array.isArray(retryAfter) ? retryAfter[0] : retryAfter;
    const retryAfterSeconds =
      typeof retryAfterValue === 'string' ? Number.parseInt(retryAfterValue, 10) : NaN;

    return Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 2000;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
