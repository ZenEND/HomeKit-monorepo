import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SimklMediaType } from './plans.enums';
import type { SimklCalendarItem } from './simkl.types';

const SIMKL_CALENDAR_URLS: Record<SimklMediaType, string> = {
  [SimklMediaType.Anime]: 'https://data.simkl.in/calendar/anime.json',
  [SimklMediaType.Tv]: 'https://data.simkl.in/calendar/tv.json',
  [SimklMediaType.Movie]: 'https://data.simkl.in/calendar/movie_release.json',
};

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

@Injectable()
export class SimklService {
  private readonly logger = new Logger(SimklService.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchCalendar(mediaType: SimklMediaType): Promise<SimklCalendarItem[]> {
    const clientId = this.getClientId();
    const appName = this.configService.get<string>('SIMKL_APP_NAME', 'homekit');
    const appVersion = this.configService.get<string>('SIMKL_APP_VERSION', '1.0');
    const userAgent = this.configService.get<string>(
      'SIMKL_USER_AGENT',
      `${appName}/${appVersion}`,
    );

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get<SimklCalendarItem[]>(SIMKL_CALENDAR_URLS[mediaType], {
          params: {
            client_id: clientId,
            'app-name': appName,
            'app-version': appVersion,
          },
          headers: { 'User-Agent': userAgent },
          timeout: 30_000,
        });

        const items = Array.isArray(response.data) ? response.data : [];
        this.logger.log(`Fetched ${items.length} ${mediaType} items from Simkl`);
        return items;
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES - 1;

        if (isLastAttempt || !this.isRetryableError(error)) {
          throw error;
        }

        this.logger.warn(
          `Simkl ${mediaType} request failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS}ms…`,
        );
        await this.sleep(RETRY_DELAY_MS);
      }
    }

    return [];
  }

  private getClientId(): string {
    const clientId = this.configService.get<string>('SIMKL_CLIENT_ID');

    if (!clientId) {
      throw new BadRequestException(
        'SIMKL_CLIENT_ID is not configured. Add it to api/.env to sync Simkl calendar data.',
      );
    }

    return clientId;
  }

  /** Retry on network-level errors and Simkl 5xx responses. */
  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    const status = error.response?.status;
    return !status || status >= 500;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
