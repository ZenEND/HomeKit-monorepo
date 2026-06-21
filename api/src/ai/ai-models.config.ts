export type AiProviderId = 'google' | 'groq' | 'openrouter' | 'huggingface' | 'cerebras';

export const AI_MODELS = [
  {
    id: 'groq-llama-3.1-8b',
    provider: 'groq' as const,
    providerLabel: 'Groq',
    modelName: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B Instant',
    description: 'Recommended free default. Fast and reliable for Alias batches.',
    envKey: 'GROQ_API_KEY',
  },
  {
    id: 'cerebras-gpt-oss-120b',
    provider: 'cerebras' as const,
    providerLabel: 'Cerebras',
    modelName: 'gpt-oss-120b',
    label: 'GPT OSS 120B',
    description: 'Cerebras free tier. Separate limits from Groq and Gemini.',
    envKey: 'CEREBRAS_API_KEY',
  },
  {
    id: 'huggingface-llama-3.1-8b',
    provider: 'huggingface' as const,
    providerLabel: 'Hugging Face',
    modelName: 'meta-llama/Llama-3.1-8B-Instruct',
    label: 'Llama 3.1 8B',
    description: 'Hugging Face inference router. Good backup for simple word lists.',
    envKey: 'HUGGINGFACE_API_KEY',
  },
  {
    id: 'gemini-2.0-flash-lite',
    provider: 'google' as const,
    providerLabel: 'Google Gemini',
    modelName: 'gemini-2.0-flash-lite',
    label: 'Gemini 2.0 Flash Lite',
    description: 'Google free tier with structured JSON output.',
    envKey: 'GEMINI_API_KEY',
  },
  {
    id: 'openrouter-llama-3.2-3b-free',
    provider: 'openrouter' as const,
    providerLabel: 'OpenRouter',
    modelName: 'meta-llama/llama-3.2-3b-instruct:free',
    label: 'Llama 3.2 3B Free',
    description: 'Shared free route. Can be busy even with zero account usage.',
    envKey: 'OPENROUTER_API_KEY',
  },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]['id'];

export const AI_MODEL_IDS: AiModelId[] = AI_MODELS.map((model) => model.id);

export const DEFAULT_AI_MODEL: AiModelId = 'groq-llama-3.1-8b';

export type ModelHealthStatus =
  | 'available'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'error'
  | 'not_configured';

export interface ModelHealthResult {
  id: AiModelId;
  provider: AiProviderId;
  providerLabel: string;
  label: string;
  description: string;
  status: ModelHealthStatus;
  message?: string;
}

export function getAiModel(modelId?: string) {
  return AI_MODELS.find((model) => model.id === modelId);
}

export function isAiModelId(value?: string): value is AiModelId {
  return AI_MODEL_IDS.includes(value as AiModelId);
}

export function resolveAiModelId(value?: string): AiModelId {
  return isAiModelId(value) ? value : DEFAULT_AI_MODEL;
}

export function getModelApiKey(model: (typeof AI_MODELS)[number]) {
  return process.env[model.envKey]?.trim() || '';
}
