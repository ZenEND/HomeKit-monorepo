import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const SHIKIMORI_GRAPHQL_URL = 'https://shikimori.io/api/graphql';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

export interface ShikimoriPoster {
  originalUrl: string | null;
  mainUrl: string | null;
}

export interface ShikimoriGenre {
  id?: string;
  name: string;
  russian: string | null;
  kind?: string;
}

export interface ShikimoriAnime {
  id: string;
  malId: string | null;
  name: string;
  russian: string | null;
  licenseNameRu: string | null;
  english: string | null;
  score: number | null;
  status: string | null;
  kind: string | null;
  season: string | null;
  poster: ShikimoriPoster | null;
  genres: ShikimoriGenre[];
  fandubbers: string[];
  fansubbers: string[];
}

interface ShikimoriGraphQlResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

const ANIME_BY_MAL_ID_QUERY = `
  query AnimeByMalId($ids: String!) {
    animes(ids: $ids, limit: 1) {
      id
      malId
      name
      russian
      licenseNameRu
      english
      score
      status
      kind
      season
      poster { originalUrl mainUrl }
      genres { id name russian kind }
      fandubbers
      fansubbers
    }
  }
`;

const ANIME_SEARCH_QUERY = `
  query AnimeSearch($search: String!, $limit: PositiveInt!) {
    animes(search: $search, limit: $limit) {
      id
      malId
      name
      russian
      licenseNameRu
      english
      score
      status
      kind
      season
      poster { originalUrl mainUrl }
      genres { id name russian kind }
      fandubbers
      fansubbers
    }
  }
`;

@Injectable()
export class ShikimoriService {
  private readonly logger = new Logger(ShikimoriService.name);
  private lastRequestAt = 0;
  private readonly minIntervalMs = 1100;

  constructor(private readonly configService: ConfigService) {}

  async fetchByMalId(malId: number): Promise<ShikimoriAnime | null> {
    const response = await this.query<{ animes: ShikimoriAnime[] }>(ANIME_BY_MAL_ID_QUERY, {
      ids: String(malId),
    });

    return response?.animes?.[0] ?? null;
  }

  async fetchBySearch(query: string, limit = 5): Promise<ShikimoriAnime[]> {
    const response = await this.query<{ animes: ShikimoriAnime[] }>(ANIME_SEARCH_QUERY, {
      search: query,
      limit,
    });

    return response?.animes ?? [];
  }

  private async query<T>(
    query: string,
    variables: Record<string, string | number>,
  ): Promise<T | null> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      await this.throttle();

      try {
        const response = await axios.post<ShikimoriGraphQlResponse<T>>(
          SHIKIMORI_GRAPHQL_URL,
          { query, variables },
          {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': this.getUserAgent(),
            },
            timeout: 20_000,
          },
        );

        if (response.data?.errors?.length) {
          throw new Error(response.data.errors.map((entry) => entry.message).join('; '));
        }

        return response.data?.data ?? null;
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES - 1;

        if (attempt === 0 && this.isRateLimitError(error)) {
          await this.sleep(this.getRetryDelayMs(error));
          continue;
        }

        if (isLastAttempt) {
          this.logger.warn(`Shikimori GraphQL request failed: ${String(error)}`);
          return null;
        }

        await this.sleep(RETRY_DELAY_MS);
      }
    }

    return null;
  }

  private getUserAgent(): string {
    const appName = this.configService.get<string>('SHIKIMORI_APP_NAME', 'homekit');
    const appVersion = this.configService.get<string>('SIMKL_APP_VERSION', '1.0');
    return `${appName}/${appVersion}`;
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
