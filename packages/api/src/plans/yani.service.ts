import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type {
  YaniAnimeDetails,
  YaniAnimeResponse,
  YaniAnimeSummary,
  YaniSearchResponse,
} from './yani.types';

const YANI_BASE_URL = 'https://api.yani.tv';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

@Injectable()
export class YaniService {
  private readonly logger = new Logger(YaniService.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchByMalId(malId: number): Promise<YaniAnimeDetails | null> {
    const summary = await this.findSummaryByMalId(malId);
    if (!summary?.anime_url) {
      return null;
    }

    return this.fetchByUrl(summary.anime_url);
  }

  async fetchByShikimoriId(shikimoriId: number): Promise<YaniAnimeDetails | null> {
    const summary = await this.findSummaryByRemoteId('shikimori_id', shikimoriId);
    if (!summary?.anime_url) {
      return null;
    }

    return this.fetchByUrl(summary.anime_url);
  }

  async fetchByUrl(animeUrl: string): Promise<YaniAnimeDetails | null> {
    const response = await this.get<YaniAnimeResponse>(`/anime/${encodeURIComponent(animeUrl)}`);
    return response?.response ?? null;
  }

  async search(query: string, limit = 5): Promise<YaniAnimeSummary[]> {
    const response = await this.get<YaniSearchResponse>('/search', {
      q: query,
      limit,
    });

    return response?.response ?? [];
  }

  private async findSummaryByMalId(malId: number): Promise<YaniAnimeSummary | null> {
    return this.findSummaryByRemoteId('myanimelist_id', malId);
  }

  private async findSummaryByRemoteId(
    field: 'myanimelist_id' | 'shikimori_id',
    id: number,
  ): Promise<YaniAnimeSummary | null> {
    const searchResults = await this.search(String(id), 10);
    const match = searchResults.find((item) => item.remote_ids?.[field] === id);
    return match ?? null;
  }

  private async get<T>(path: string, params?: Record<string, string | number>): Promise<T | null> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get<T>(`${YANI_BASE_URL}${path}`, {
          params,
          headers: this.getHeaders(),
          timeout: 20_000,
        });

        return response.data;
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES - 1;

        if (isLastAttempt || !this.isRetryableError(error)) {
          this.logger.warn(`Yani request failed for ${path}: ${String(error)}`);
          return null;
        }

        await this.sleep(RETRY_DELAY_MS);
      }
    }

    return null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Lang: 'uk',
    };

    const appToken = this.configService.get<string>('YANI_APP_TOKEN');
    if (appToken) {
      headers['X-Application'] = appToken;
    }

    return headers;
  }

  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const status = error.response?.status;
    return !status || status >= 500;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
