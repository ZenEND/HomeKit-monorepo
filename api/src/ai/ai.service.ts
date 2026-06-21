import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { getErrorMessage, isRetryableProviderError } from './ai-errors';
import {
  AI_MODELS,
  AiModelId,
  ModelHealthResult,
  resolveAiModelId,
} from './ai-models.config';
import { GenerateTextDto, GenerateTextDifficulty } from './dto/generate-text.dto';
import {
  createAiProviders,
  GeneratedAliasWord,
  getProviderForModel,
} from './providers/ai-providers';

export interface GenerateTextResponse {
  words: GeneratedAliasWord[];
  model: AiModelId;
}

interface UsedWordEntry {
  language: string;
  word: string;
}

interface CachedModelHealth {
  result: ModelHealthResult;
  expiresAt: number;
}

@Injectable()
export class AiService {
  private readonly batchSize = 5;
  private readonly maxUsedWords = 500;
  private readonly maxExcludedWordsPerRequest = 50;
  private readonly healthCacheTtlMs = 10 * 60 * 1000;
  private readonly usedWordsQueue: UsedWordEntry[] = [];
  private readonly usedWordsSet = new Set<string>();
  private readonly modelHealthCache = new Map<AiModelId, CachedModelHealth>();
  private readonly logger = new Logger(AiService.name);
  private readonly providers = createAiProviders();

  async generateText(options: GenerateTextDto) {
    const normalizedOptions = this.normalizeGenerateTextOptions(options);
    const words: GeneratedAliasWord[] = [];
    const usedWords = new Set(normalizedOptions.excludeWords.map((word) => this.normalizeWord(word)));
    const maxAttempts = Math.ceil(normalizedOptions.count / this.batchSize) + 3;
    let activeModel = normalizedOptions.model;

    for (let attempt = 0; words.length < normalizedOptions.count && attempt < maxAttempts; attempt += 1) {
      const batchCount = Math.min(this.batchSize, normalizedOptions.count - words.length);

      try {
        const response = await this.generateWordsBatchWithFallback({
          ...normalizedOptions,
          model: activeModel,
          count: batchCount,
          excludeWords: [...normalizedOptions.excludeWords, ...words.map((item) => item.word)],
        });

        activeModel = response.model;

        for (const item of response.words) {
          const wordKey = this.normalizeWord(item.word);

          if (!wordKey || usedWords.has(wordKey)) {
            continue;
          }

          words.push(item);
          usedWords.add(wordKey);

          if (words.length === normalizedOptions.count) {
            break;
          }
        }
      } catch (error) {
        if (isRetryableProviderError(error)) {
          const fallbackModel = await this.findAvailableModel(activeModel);

          if (fallbackModel && fallbackModel !== activeModel) {
            this.logger.warn(`Model ${activeModel} unavailable. Falling back to ${fallbackModel}.`);
            activeModel = fallbackModel;
            continue;
          }
        }

        throw error instanceof BadGatewayException
          ? error
          : new BadGatewayException(getErrorMessage(error));
      }
    }

    if (words.length !== normalizedOptions.count) {
      throw new BadGatewayException('AI could not generate enough unique words.');
    }

    this.rememberUsedWords(normalizedOptions.language, words.map((item) => item.word));

    return { words, model: activeModel };
  }

  async getModelsHealth(refresh = false) {
    const checkedAt = new Date().toISOString();
    let usedCache = !refresh;

    const models = await Promise.all(
      AI_MODELS.map(async (model) => {
        const cached = this.modelHealthCache.get(model.id);

        if (!refresh && cached && cached.expiresAt > Date.now()) {
          return cached.result;
        }

        usedCache = false;
        const result = await getProviderForModel(this.providers, model.id).provider.probe(model);
        this.modelHealthCache.set(model.id, {
          result,
          expiresAt: Date.now() + this.healthCacheTtlMs,
        });

        return result;
      }),
    );

    return {
      checkedAt,
      cached: usedCache,
      models,
    };
  }

  private async findAvailableModel(excludedModel: AiModelId) {
    for (const model of AI_MODELS) {
      if (model.id === excludedModel) {
        continue;
      }

      const { provider } = getProviderForModel(this.providers, model.id);
      const health = await provider.probe(model);
      this.modelHealthCache.set(model.id, {
        result: health,
        expiresAt: Date.now() + this.healthCacheTtlMs,
      });

      if (health.status === 'available') {
        return model.id;
      }
    }

    return null;
  }

  private async generateWordsBatchWithFallback(options: {
    count: number;
    language: string;
    difficulty: GenerateTextDifficulty;
    categories: string[];
    excludeWords: string[];
    model: AiModelId;
  }): Promise<GenerateTextResponse> {
    const modelsToTry = [
      options.model,
      ...AI_MODELS.map((model) => model.id).filter((modelId) => modelId !== options.model),
    ];

    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const { model, provider } = getProviderForModel(this.providers, modelId);
        const words = await provider.generateWords(model, {
          count: options.count,
          language: options.language,
          difficulty: options.difficulty,
          categories: options.categories,
          excludeWords: options.excludeWords,
        });

        return { words, model: modelId };
      } catch (error) {
        lastError = error;
        const model = AI_MODELS.find((item) => item.id === modelId)!;
        const { provider } = getProviderForModel(this.providers, modelId);
        const health = isRetryableProviderError(error) ? await provider.probe(model) : null;

        if (health) {
          this.modelHealthCache.set(modelId, {
            result: health,
            expiresAt: Date.now() + this.healthCacheTtlMs,
          });
          this.logger.warn(`Model ${modelId} unavailable (${health.status}). Trying next model.`);
          continue;
        }

        this.logger.warn(`Model ${modelId} failed: ${getErrorMessage(error)}`);
      }
    }

    throw lastError instanceof BadGatewayException
      ? lastError
      : new BadGatewayException(
          isRetryableProviderError(lastError)
            ? 'All configured models are busy or out of quota. Try again shortly or add another API key.'
            : 'AI failed to generate a words batch.',
        );
  }

  private normalizeGenerateTextOptions(options: GenerateTextDto) {
    const count = Math.min(Math.max(Number(options.count) || 10, 1), 100);
    const difficulty = this.normalizeDifficulty(options.difficulty);
    const categories = this.normalizeCategories(options);
    const excludeWords = this.getRecentlyUsedWords(options.language?.trim() || 'English');

    return {
      count,
      language: options.language?.trim() || 'English',
      difficulty,
      categories,
      excludeWords,
      model: resolveAiModelId(options.model),
    };
  }

  private normalizeCategories(options: GenerateTextDto) {
    const categories = Array.isArray(options.categories)
      ? options.categories.map((category) => category.trim()).filter(Boolean)
      : [];
    const topic = options.topic?.trim();

    if (categories.length > 0) {
      return [...new Set(categories)];
    }

    return topic ? [topic] : [];
  }

  private normalizeDifficulty(difficulty?: string): GenerateTextDifficulty {
    const allowedDifficulties: GenerateTextDifficulty[] = ['easy', 'medium', 'hard', 'mixed'];

    return allowedDifficulties.includes(difficulty as GenerateTextDifficulty)
      ? (difficulty as GenerateTextDifficulty)
      : 'mixed';
  }

  private getRecentlyUsedWords(language: string) {
    const languageKey = this.normalizeLanguage(language);

    return this.usedWordsQueue
      .filter((item) => item.language === languageKey)
      .map((item) => item.word)
      .slice(-this.maxExcludedWordsPerRequest);
  }

  private rememberUsedWords(language: string, words: string[]) {
    const languageKey = this.normalizeLanguage(language);

    for (const word of words) {
      const normalizedWord = this.normalizeWord(word);
      const usedWordKey = `${languageKey}:${normalizedWord}`;

      if (!normalizedWord || this.usedWordsSet.has(usedWordKey)) {
        continue;
      }

      this.usedWordsQueue.push({ language: languageKey, word });
      this.usedWordsSet.add(usedWordKey);
    }

    while (this.usedWordsQueue.length > this.maxUsedWords) {
      const removed = this.usedWordsQueue.shift();

      if (removed) {
        this.usedWordsSet.delete(`${removed.language}:${this.normalizeWord(removed.word)}`);
      }
    }
  }

  private normalizeLanguage(language: string) {
    return language.trim().toLowerCase();
  }

  private normalizeWord(word: string) {
    return word.trim().toLowerCase();
  }
}
