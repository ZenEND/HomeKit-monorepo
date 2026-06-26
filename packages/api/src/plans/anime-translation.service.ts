import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { IsNull, Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { TitleTranslationSource } from './plans.enums';
import { MediaTitleEntity } from './media-title.entity';

const BATCH_SIZE = 20;
const MAX_BATCHES = 50;
const PER_PROVIDER_DELAY_MS = 250;

const TRANSLATION_PRIORITY: TitleTranslationSource[] = [
  TitleTranslationSource.MyMemory,
  TitleTranslationSource.Lingva,
  TitleTranslationSource.Ai,
];

interface TranslationItem {
  id: string;
  simklId?: number | null;
  title: string;
  titleEn?: string | null;
}

interface TranslationSuccess {
  titleUa: string;
  source: TitleTranslationSource;
}

@Injectable()
export class AnimeTranslationService {
  private readonly logger = new Logger(AnimeTranslationService.name);

  constructor(
    @InjectRepository(MediaTitleEntity)
    private readonly calendarRepository: Repository<MediaTitleEntity>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Runs translateMissingTitles in a loop until no untranslated items remain
   * or the safety cap is reached. Returns total items translated.
   */
  async translateAllMissingTitles(): Promise<number> {
    this.logger.log(
      `Starting full translation pass with priority: ${TRANSLATION_PRIORITY.join(' -> ')}.`,
    );
    let total = 0;

    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      const count = await this.translateMissingTitles(batch + 1);
      total += count;

      if (count === 0) {
        break;
      }
    }

    if (total > 0) {
      this.logger.log(`Translated ${total} missing titles in total.`);
    } else {
      this.logger.log('No missing titles to translate.');
    }

    return total;
  }

  async translateMissingTitles(batchNumber = 1): Promise<number> {
    const items = await this.calendarRepository.find({
      where: { titleUa: IsNull() },
      order: { airDate: 'ASC' },
      take: BATCH_SIZE,
    });

    if (items.length === 0) {
      return 0;
    }

    this.logger.log(
      `Translating batch ${batchNumber}: ${items.length} items one-by-one with provider fallback.`,
    );

    let updated = 0;

    for (const item of items) {
      const translation = await this.translateSingleTitle({
        id: item.id,
        simklId: item.simklId,
        title: item.title,
        titleEn: item.titleEn,
      });

      if (!translation) {
        continue;
      }

      await this.calendarRepository.update(item.id, {
        titleUa: translation.titleUa,
        titleTranslationSource: translation.source,
        titleTranslatedAt: new Date(),
      });
      updated += 1;
    }

    this.logger.log(`Batch ${batchNumber} complete: translated ${updated}/${items.length} items.`);

    return updated;
  }

  private async translateSingleTitle(item: TranslationItem): Promise<TranslationSuccess | null> {
    const sourceText = (item.titleEn ?? item.title).trim();
    if (!sourceText) {
      return null;
    }

    for (const provider of TRANSLATION_PRIORITY) {
      try {
        const titleUa = await this.translateWithProvider(item, sourceText, provider);
        if (titleUa) {
          this.logger.debug(
            `Translated titleId=${item.id} via ${provider}: "${titleUa}".`,
          );
          return { titleUa, source: provider };
        }

        this.logger.debug(
          `Provider ${provider} returned no usable translation for titleId=${item.id}.`,
        );
      } catch (error) {
        this.logger.warn(
          `Provider ${provider} failed for titleId=${item.id}: ${String(error)}. Trying next provider.`,
        );
      }

      await this.sleep(PER_PROVIDER_DELAY_MS);
    }

    this.logger.warn(
      `All translation providers failed for titleId=${item.id} title="${sourceText}".`,
    );
    return null;
  }

  private async translateWithProvider(
    item: TranslationItem,
    sourceText: string,
    provider: TitleTranslationSource,
  ): Promise<string | null> {
    switch (provider) {
      case TitleTranslationSource.MyMemory:
        return this.translateWithMyMemory(sourceText);
      case TitleTranslationSource.Lingva:
        return this.translateWithLingva(sourceText);
      case TitleTranslationSource.Ai:
        return this.translateWithAi(item);
      default:
        return null;
    }
  }

  private async translateWithMyMemory(sourceText: string): Promise<string | null> {
    const response = await axios.get<{
      responseData?: { translatedText?: string };
    }>('https://api.mymemory.translated.net/get', {
      params: {
        q: sourceText,
        langpair: 'en|uk',
      },
      timeout: 15_000,
    });

    const translatedText = response.data?.responseData?.translatedText?.trim();
    return translatedText && !this.isSameText(translatedText, sourceText) ? translatedText : null;
  }

  private async translateWithLingva(sourceText: string): Promise<string | null> {
    const response = await axios.get<{ translation?: string }>(
      `https://lingva.ml/api/v1/en/uk/${encodeURIComponent(sourceText)}`,
      { timeout: 15_000 },
    );

    const translatedText = response.data?.translation?.trim();
    return translatedText && !this.isSameText(translatedText, sourceText) ? translatedText : null;
  }

  private async translateWithAi(item: TranslationItem): Promise<string | null> {
    const translations = await this.aiService.translateAnimeTitles([
      {
        simklId: item.simklId ?? 0,
        title: item.title,
        titleEn: item.titleEn,
      },
    ]);

    const translatedText = translations[0]?.titleUa?.trim();
    const sourceText = (item.titleEn ?? item.title).trim();
    return translatedText && !this.isSameText(translatedText, sourceText) ? translatedText : null;
  }

  private isSameText(left: string, right: string): boolean {
    return left.trim().toLowerCase() === right.trim().toLowerCase();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
