import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import type { AniHubAnime, AniHubAnimeDetails, AniHubListResponse } from './anihub.types';

const ANIHUB_BASE_URL = 'https://api.anihub.in.ua';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

@Injectable()
export class AniHubService {
  private readonly logger = new Logger(AniHubService.name);

  async fetchByMalId(malId: number): Promise<AniHubAnime | null> {
    const response = await this.get<AniHubListResponse>('/anime', {
      mal_id: malId,
      page_size: 1,
    });

    return response?.items?.[0] ?? null;
  }

  async fetchById(animeId: number): Promise<AniHubAnimeDetails | null> {
    return this.get<AniHubAnimeDetails>(`/anime/${animeId}`);
  }

  async fetchSeasonal(limit: number): Promise<AniHubAnime[]> {
    const response = await this.get<AniHubAnime[]>('/anime/seasonal', { limit });
    return Array.isArray(response) ? response : [];
  }

  async fetchPopular(limit: number): Promise<AniHubAnime[]> {
    const response = await this.get<AniHubAnime[]>('/anime/popular', { limit });
    return Array.isArray(response) ? response : [];
  }

  private async get<T>(path: string, params?: Record<string, string | number>): Promise<T | null> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get<T>(`${ANIHUB_BASE_URL}${path}`, {
          params,
          timeout: 15_000,
        });

        return response.data;
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES - 1;

        if (isLastAttempt || !this.isRetryableError(error)) {
          this.logger.warn(`AniHub request failed for ${path}: ${String(error)}`);
          return null;
        }

        await this.sleep(RETRY_DELAY_MS);
      }
    }

    return null;
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
