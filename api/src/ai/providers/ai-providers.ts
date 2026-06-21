import { BadGatewayException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  classifyProviderError,
  getErrorMessage,
  getQuotaRetryDelayMs,
} from '../ai-errors';
import {
  AI_MODELS,
  getModelApiKey,
  ModelHealthResult,
  type AiModelId,
  type AiProviderId,
} from '../ai-models.config';
import { GenerateTextDifficulty } from '../dto/generate-text.dto';

export interface AliasGenerationOptions {
  count: number;
  language: string;
  difficulty: GenerateTextDifficulty;
  categories: string[];
  excludeWords: string[];
}

export interface GeneratedAliasWord {
  word: string;
  difficulty: Exclude<GenerateTextDifficulty, 'mixed'>;
  category: string;
  hint?: string;
}

export interface AiProvider {
  probe(model: (typeof AI_MODELS)[number]): Promise<ModelHealthResult>;
  generateWords(
    model: (typeof AI_MODELS)[number],
    options: AliasGenerationOptions,
  ): Promise<GeneratedAliasWord[]>;
}

const aliasWordsResponseSchema = {
  type: 'object',
  properties: {
    words: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          category: { type: 'string' },
          hint: { type: 'string' },
        },
        required: ['word', 'difficulty', 'category'],
      },
    },
  },
  required: ['words'],
} as const;

function buildHealthResult(
  model: (typeof AI_MODELS)[number],
  status: ModelHealthResult['status'],
  message?: string,
): ModelHealthResult {
  return {
    id: model.id,
    provider: model.provider,
    providerLabel: model.providerLabel,
    label: model.label,
    description: model.description,
    status,
    message,
  };
}

function buildLanguageGuidance(language: string) {
  const normalizedLanguage = language.trim().toLowerCase();

  if (normalizedLanguage.includes('ukrain')) {
    return `Ukrainian word quality (important):
- Use popular, everyday Ukrainian words that most native speakers know from daily life.
- Prefer common nouns from home, food, nature, transport, school, work, hobbies, and culture.
- Use standard literary Ukrainian spelling and grammar.
- Words must be easy to pronounce correctly from their spelling — avoid rare archaisms, dialect forms, or words with ambiguous stress/pronunciation.
- Do not use transliteration, Russian words, or Surzhyk unless explicitly requested.
- For each word, add a short "hint" (3–10 words): a plain-language gloss or pronunciation/stress note for the explainer. Do not repeat the word itself in the hint.`;
  }

  return `Word quality (important):
- Use popular, common words that most native speakers of ${language} know from everyday life.
- Avoid obscure, archaic, or highly specialized terms unless difficulty is hard.
- Spelling must match standard pronunciation — no words that are commonly mispronounced or ambiguous to say aloud.
- For each word, add a short "hint" (3–10 words): a brief gloss or pronunciation note for the explainer. Do not repeat the word itself in the hint.`;
}

function buildAliasWordsPrompt(options: AliasGenerationOptions) {
  return `You are a word generator for an Alias-style guessing game.

Generate words using these parameters:
- count: ${options.count}
- language: ${options.language}
- difficulty: ${options.difficulty}
- categories: ${options.categories.length > 0 ? JSON.stringify(options.categories) : 'any'}
- excludeWords: ${JSON.stringify(options.excludeWords)}

${buildLanguageGuidance(options.language)}

Requirements:
- Return only valid JSON.
- Generate exactly ${options.count} words.
- Words must be in ${options.language}.
- Match the requested difficulty.
- If difficulty is mixed, distribute words across easy, medium, and hard.
- If categories are provided, distribute words across them.
- Do not repeat words or use excludeWords.
- Avoid offensive, adult, political, religious, or sensitive words.
- "easy" = very common words (children know them); "medium" = familiar adult vocabulary; "hard" = still well-known but less obvious in Alias.

Response format:
{
  "words": [
    { "word": "string", "difficulty": "easy|medium|hard", "category": "string", "hint": "optional short note for the explainer" }
  ]
}`;
}

function parseWordsFromJson(text?: string) {
  if (!text?.trim()) {
    throw new BadGatewayException('AI response was empty.');
  }

  try {
    const parsed = JSON.parse(text) as { words?: GeneratedAliasWord[] };
    return Array.isArray(parsed.words)
      ? parsed.words
          .filter((item) => item?.word)
          .map((item) => ({
            word: item.word.trim(),
            difficulty: item.difficulty,
            category: item.category?.trim() || 'general',
            ...(item.hint?.trim() ? { hint: item.hint.trim() } : {}),
          }))
      : [];
  } catch {
    throw new BadGatewayException('AI response was not valid JSON.');
  }
}

function getMaxOutputTokens(count: number) {
  return Math.min(Math.max(count * 200, 1500), 4096);
}

const PROBE_GENERATION_OPTIONS: AliasGenerationOptions = {
  count: 1,
  language: 'English',
  difficulty: 'easy',
  categories: [],
  excludeWords: [],
};

async function probeWithGeneration(
  model: (typeof AI_MODELS)[number],
  generateWords: AiProvider['generateWords'],
) {
  try {
    const words = await generateWords(model, PROBE_GENERATION_OPTIONS);

    return words.length > 0
      ? buildHealthResult(model, 'available')
      : buildHealthResult(model, 'error', 'Model returned no words during generation test.');
  } catch (error) {
    return mapProviderError(model, error);
  }
}

function mapProviderError(model: (typeof AI_MODELS)[number], error: unknown): ModelHealthResult {
  const kind = classifyProviderError(error);
  const retryDelayMs = getQuotaRetryDelayMs(error);

  if (kind === 'rate_limited') {
    return buildHealthResult(
      model,
      'rate_limited',
      retryDelayMs > 0
        ? `Model busy upstream. Retry in about ${Math.ceil(retryDelayMs / 1000)}s.`
        : 'Model temporarily busy upstream. Try again shortly.',
    );
  }

  if (kind === 'quota_exceeded') {
    return buildHealthResult(
      model,
      'quota_exceeded',
      retryDelayMs > 0
        ? `Daily quota reached. Retry in about ${Math.ceil(retryDelayMs / 1000)}s.`
        : 'Daily quota reached for this model.',
    );
  }

  return buildHealthResult(model, 'error', getErrorMessage(error));
}

export class GoogleAiProvider implements AiProvider {
  private readonly client: GoogleGenAI | null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async probe(model: (typeof AI_MODELS)[number]) {
    if (!this.client) {
      return buildHealthResult(model, 'not_configured', `Set ${model.envKey} in api/.env`);
    }

    return probeWithGeneration(model, this.generateWords.bind(this));
  }

  async generateWords(model: (typeof AI_MODELS)[number], options: AliasGenerationOptions) {
    if (!this.client) {
      throw new BadGatewayException(`Set ${model.envKey} in api/.env`);
    }

    const response = await this.client.models.generateContent({
      model: model.modelName,
      contents: buildAliasWordsPrompt(options),
      config: {
        temperature: 0.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: getMaxOutputTokens(options.count),
        responseMimeType: 'application/json',
        responseSchema: aliasWordsResponseSchema,
      },
    });

    return parseWordsFromJson(response.text);
  }
}

interface OpenAiCompatibleConfig {
  baseUrl: string;
  referer?: string;
  appTitle?: string;
}

async function requestChatCompletion(
  config: OpenAiCompatibleConfig,
  apiKey: string,
  modelName: string,
  prompt: string,
  maxTokens: number,
  jsonMode: boolean,
) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(config.referer ? { 'HTTP-Referer': config.referer } : {}),
      ...(config.appTitle ? { 'X-Title': config.appTitle } : {}),
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: {
      message?: string;
      metadata?: { raw?: string; retry_after_seconds?: number };
    };
  };

  if (!response.ok) {
    const rawDetails = payload.error?.metadata?.raw;
    const retryAfterSeconds = payload.error?.metadata?.retry_after_seconds;
    const message = [payload.error?.message, rawDetails].filter(Boolean).join(': ') || `Provider request failed (${response.status})`;
    const suffix =
      retryAfterSeconds !== undefined
        ? ` retry_after_seconds ${retryAfterSeconds}`
        : response.status === 429
          ? ' retry shortly'
          : '';

    throw new BadGatewayException(`${response.status} ${message}${suffix}`);
  }

  return payload.choices?.[0]?.message?.content;
}

export class OpenAiCompatibleProvider implements AiProvider {
  constructor(private readonly config: OpenAiCompatibleConfig) {}

  async probe(model: (typeof AI_MODELS)[number]) {
    const apiKey = getModelApiKey(model);

    if (!apiKey) {
      return buildHealthResult(model, 'not_configured', `Set ${model.envKey} in api/.env`);
    }

    return probeWithGeneration(model, this.generateWords.bind(this));
  }

  async generateWords(model: (typeof AI_MODELS)[number], options: AliasGenerationOptions) {
    const apiKey = getModelApiKey(model);

    if (!apiKey) {
      throw new BadGatewayException(`Set ${model.envKey} in api/.env`);
    }

    const content = await requestChatCompletion(
      this.config,
      apiKey,
      model.modelName,
      buildAliasWordsPrompt(options),
      getMaxOutputTokens(options.count),
      true,
    );

    return parseWordsFromJson(content);
  }
}

export function createAiProviders(): Record<AiProviderId, AiProvider> {
  return {
    google: new GoogleAiProvider(),
    groq: new OpenAiCompatibleProvider({ baseUrl: 'https://api.groq.com/openai/v1' }),
    openrouter: new OpenAiCompatibleProvider({
      baseUrl: 'https://openrouter.ai/api/v1',
      referer: process.env.APP_URL ?? 'http://localhost:5173',
      appTitle: 'HomeKit',
    }),
    huggingface: new OpenAiCompatibleProvider({
      baseUrl: 'https://router.huggingface.co/v1',
    }),
    cerebras: new OpenAiCompatibleProvider({
      baseUrl: 'https://api.cerebras.ai/v1',
    }),
  };
}

export function getProviderForModel(providers: Record<AiProviderId, AiProvider>, modelId: AiModelId) {
  const model = AI_MODELS.find((item) => item.id === modelId);

  if (!model) {
    throw new BadGatewayException('Unknown AI model.');
  }

  return { model, provider: providers[model.provider] };
}
