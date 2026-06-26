import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { getErrorMessage, isRetryableProviderError } from './ai-errors';
import {
  AI_MODELS,
  AiModelId,
  ModelHealthResult,
  getModelApiKey,
  resolveAiModelId,
} from './ai-models.config';
import { GenerateTextDto, GenerateTextDifficulty } from './dto/generate-text.dto';
import {
  createAiProviders,
  GeneratedAliasWord,
  getProviderForModel,
  requestChatCompletion,
} from './providers/ai-providers';

export interface GenerateTextResponse {
  words: GeneratedAliasWord[];
  model: AiModelId;
}

export interface CardFieldsResult {
  name?: string;
  description?: string;
  flavorText?: string;
  level?: number;
  treasureCount?: number;
  badStuff?: string;
  itemBonus?: number;
  itemValue?: number;
  tags?: string[];
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

  async generateCardFields(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<CardFieldsResult> {
    const configuredModels = AI_MODELS.filter((m) => getModelApiKey(m));
    if (configuredModels.length === 0) {
      throw new BadGatewayException('No AI model is configured. Set at least one API key in api/.env (e.g. GROQ_API_KEY).');
    }

    const fullPrompt = `System: ${systemPrompt}\n\nUser: ${userPrompt}`;
    const modelsToTry = configuredModels.map((model) => model.id);
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const content = await this.requestJsonCompletion(modelId, fullPrompt, 512);
        const raw = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return this.coerceCardFields(parsed);
      } catch (error) {
        lastError = error;
        if (isRetryableProviderError(error)) {
          continue;
        }
      }
    }

    throw lastError instanceof BadGatewayException
      ? lastError
      : new BadGatewayException('AI failed to generate card fields.');
  }

  private coerceCardFields(raw: Record<string, unknown>): CardFieldsResult {
    const str = (v: unknown, maxLen: number): string | undefined => {
      if (typeof v !== 'string' || !v.trim()) return undefined;
      return v.trim().slice(0, maxLen);
    };
    const num = (v: unknown, min: number, max: number): number | undefined => {
      const n = Number(v);
      if (!isFinite(n)) return undefined;
      return Math.min(Math.max(Math.round(n), min), max);
    };
    const tags = Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === 'string').slice(0, 10)
      : undefined;

    return {
      name: str(raw.name, 80),
      description: str(raw.description, 120),
      flavorText: str(raw.flavorText, 60),
      level: num(raw.level, 1, 20),
      treasureCount: num(raw.treasureCount, 0, 5),
      badStuff: str(raw.badStuff, 200),
      itemBonus: num(raw.itemBonus, -10, 20),
      itemValue: num(raw.itemValue, 0, 10000),
      tags,
    };
  }

  async generateDoorEvent(seed: string, tone: string = 'funny'): Promise<Record<string, unknown>> {
    const prompt = `You are a creative card designer for a Munchkin-style party board game.
Generate a "Door Event" card with a dice roll system.

Seed concept: "${seed}"
Tone: ${tone}

Output ONLY valid JSON with this exact structure:
{
  "name": "Short memorable card name",
  "description": "One sentence description (max 80 chars)",
  "flavorText": "Funny one-liner, max 50 chars",
  "situationText": "2-4 paragraph narrative situation text shown to all players. Be creative and funny. Include what the player must decide or do. End with 'Roll 2d6 to see how this goes.' or similar.",
  "tiers": [
    {
      "key": "critical_success",
      "label": "🎉 Critical Success (12)",
      "minRoll": 12,
      "maxRoll": null,
      "description": "What happens on a nat 12 — best possible outcome, very rewarding",
      "effects": [{ "type": "gain_level", "amount": 1, "target": "active_player" }, { "type": "draw_treasure", "amount": 2, "target": "active_player" }],
      "animationType": "celebrate"
    },
    {
      "key": "success",
      "label": "✅ Success (9-11)",
      "minRoll": 9,
      "maxRoll": 11,
      "description": "Good outcome, some reward",
      "effects": [{ "type": "draw_treasure", "amount": 1, "target": "active_player" }],
      "animationType": "celebrate"
    },
    {
      "key": "partial",
      "label": "⚠ Partial (6-8)",
      "minRoll": 6,
      "maxRoll": 8,
      "description": "Mixed result, no gain no loss",
      "effects": [],
      "animationType": "neutral"
    },
    {
      "key": "fail",
      "label": "❌ Fail (3-5)",
      "minRoll": 3,
      "maxRoll": 5,
      "description": "Bad outcome, some punishment",
      "effects": [{ "type": "lose_level", "amount": 1, "target": "active_player" }],
      "animationType": "curse"
    },
    {
      "key": "critical_fail",
      "label": "💀 Critical Fail (2)",
      "minRoll": 2,
      "maxRoll": 2,
      "description": "Worst possible outcome — dramatic and funny failure",
      "effects": [{ "type": "lose_level", "amount": 2, "target": "active_player" }],
      "animationType": "death"
    }
  ]
}

Effect types allowed: gain_level, lose_level, draw_treasure, draw_door, gain_gold, lose_gold, discard_item, skip_turn, custom_text
Effect targets: active_player, all, left, right
Make the situation creative, funny, and thematic to the seed concept.`;

    const modelsToTry = AI_MODELS.map((model) => model.id);
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const content = await this.requestJsonCompletion(modelId, prompt, 1200);
        const raw = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        return JSON.parse(raw) as Record<string, unknown>;
      } catch (error) {
        lastError = error;
        if (isRetryableProviderError(error)) continue;
      }
    }

    throw lastError instanceof BadGatewayException
      ? lastError
      : new BadGatewayException('AI failed to generate door event.');
  }

  async translateAnimeTitles(
    items: Array<{ simklId: number; title: string; titleEn?: string | null }>,
  ): Promise<Array<{ simklId: number; titleUa: string }>> {
    if (items.length === 0) {
      return [];
    }

    const prompt = `Translate anime titles to natural Ukrainian for a watchlist UI.

Rules:
- Use official Ukrainian localized titles when they are widely known.
- Keep proper nouns readable in Ukrainian.
- Return only valid JSON.
- Translate every item in the input list.

Input:
${JSON.stringify(
  items.map((item) => ({
    simklId: item.simklId,
    title: item.title,
    titleEn: item.titleEn ?? null,
  })),
)}

Response format:
{
  "items": [
    { "simklId": 123, "titleUa": "Ukrainian title" }
  ]
}`;

    const modelsToTry = AI_MODELS.map((model) => model.id);
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const content = await this.requestJsonCompletion(modelId, prompt, 2048);
        const parsed = JSON.parse(content) as {
          items?: Array<{ simklId?: number; titleUa?: string }>;
        };

        if (!Array.isArray(parsed.items)) {
          throw new BadGatewayException('AI translation response was invalid.');
        }

        return parsed.items
          .filter((item) => item.simklId && item.titleUa?.trim())
          .map((item) => ({
            simklId: Number(item.simklId),
            titleUa: item.titleUa!.trim(),
          }));
      } catch (error) {
        lastError = error;
        if (isRetryableProviderError(error)) {
          this.logger.warn(`Translation model ${modelId} unavailable. Trying next model.`);
          continue;
        }
      }
    }

    this.logger.warn(
      `Anime title translation failed: ${getErrorMessage(lastError)}`,
    );
    return [];
  }

  private async requestJsonCompletion(
    modelId: AiModelId,
    prompt: string,
    maxTokens: number,
  ): Promise<string> {
    const { model } = getProviderForModel(this.providers, modelId);
    const apiKey = getModelApiKey(model);

    if (!apiKey) {
      throw new BadGatewayException(`Set ${model.envKey} in api/.env`);
    }

    if (model.provider === 'google') {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: model.modelName,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      });

      if (!response.text?.trim()) {
        throw new BadGatewayException('AI response was empty.');
      }

      return response.text;
    }

    const providerConfigs: Record<
      Exclude<typeof model.provider, 'google'>,
      { baseUrl: string; referer?: string; appTitle?: string }
    > = {
      groq: { baseUrl: 'https://api.groq.com/openai/v1' },
      openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        referer: process.env.APP_URL ?? 'http://localhost:5173',
        appTitle: 'HomeKit',
      },
      huggingface: { baseUrl: 'https://router.huggingface.co/v1' },
      cerebras: { baseUrl: 'https://api.cerebras.ai/v1' },
    };

    const config = providerConfigs[model.provider];
    const content = await requestChatCompletion(
      config,
      apiKey,
      model.modelName,
      prompt,
      maxTokens,
      true,
    );

    if (!content?.trim()) {
      throw new BadGatewayException('AI response was empty.');
    }

    return content;
  }
}
