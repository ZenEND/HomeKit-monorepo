export type GenerateTextDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type AiModelId =
  | 'groq-llama-3.1-8b'
  | 'cerebras-gpt-oss-120b'
  | 'huggingface-llama-3.1-8b'
  | 'gemini-2.0-flash-lite'
  | 'openrouter-llama-3.2-3b-free';

export type ModelHealthStatus =
  | 'available'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'error'
  | 'not_configured'
  | 'unknown';

export const DEFAULT_AI_MODEL: AiModelId = 'groq-llama-3.1-8b';

export interface GenerateTextRequest {
  count: number;
  language: string;
  difficulty: GenerateTextDifficulty;
  model: AiModelId;
  topic?: string;
  categories?: string[];
}

export interface AliasWord {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  hint?: string;
}

export interface GenerateTextResponse {
  words: AliasWord[];
  model: AiModelId;
}

export interface ModelHealthItem {
  id: AiModelId;
  provider: 'google' | 'groq' | 'openrouter' | 'huggingface' | 'cerebras';
  providerLabel: string;
  label: string;
  description: string;
  status: ModelHealthStatus;
  message?: string;
}

export interface ModelsHealthResponse {
  checkedAt: string;
  cached: boolean;
  models: ModelHealthItem[];
}

export const AI_MODEL_CATALOG: Array<Omit<ModelHealthItem, 'status'>> = [
  {
    id: 'groq-llama-3.1-8b',
    provider: 'groq',
    providerLabel: 'Groq',
    label: 'Llama 3.1 8B Instant',
    description: 'Recommended free default. Fast and reliable for Alias batches.',
  },
  {
    id: 'cerebras-gpt-oss-120b',
    provider: 'cerebras',
    providerLabel: 'Cerebras',
    label: 'GPT OSS 120B',
    description: 'Cerebras free tier. Separate limits from Groq and Gemini.',
  },
  {
    id: 'huggingface-llama-3.1-8b',
    provider: 'huggingface',
    providerLabel: 'Hugging Face',
    label: 'Llama 3.1 8B',
    description: 'Hugging Face inference router. Good backup for simple word lists.',
  },
  {
    id: 'gemini-2.0-flash-lite',
    provider: 'google',
    providerLabel: 'Google Gemini',
    label: 'Gemini 2.0 Flash Lite',
    description: 'Google free tier with structured JSON output.',
  },
  {
    id: 'openrouter-llama-3.2-3b-free',
    provider: 'openrouter',
    providerLabel: 'OpenRouter',
    label: 'Llama 3.2 3B Free',
    description: 'Shared free route. Can be busy even with zero account usage.',
  },
];

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function buildModelHealthList(healthItems: ModelHealthItem[] = []): ModelHealthItem[] {
  return AI_MODEL_CATALOG.map((model) => {
    const health = healthItems.find((item) => item.id === model.id);
    return health ?? { ...model, status: 'unknown' };
  });
}

export async function fetchModelsHealth(forceRefresh = false): Promise<ModelsHealthResponse> {
  const query = forceRefresh ? '?refresh=true' : '';
  const response = await fetch(`${apiUrl}/ai/models/health${query}`);

  if (!response.ok) {
    throw new Error(`Failed to check model health (${response.status})`);
  }

  const payload = (await response.json()) as ModelsHealthResponse;

  return {
    ...payload,
    models: buildModelHealthList(payload.models),
  };
}

export async function generateAliasWords(request: GenerateTextRequest): Promise<GenerateTextResponse> {
  const response = await fetch(`${apiUrl}/ai/generate-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Failed to generate words (${response.status})`);
  }

  return response.json() as Promise<GenerateTextResponse>;
}

export function modelStatusLabel(status: ModelHealthStatus) {
  switch (status) {
    case 'available':
      return 'Available';
    case 'rate_limited':
      return 'Busy';
    case 'quota_exceeded':
      return 'Quota reached';
    case 'not_configured':
      return 'Not configured';
    case 'unknown':
      return 'Not checked';
    case 'error':
      return 'Unavailable';
  }
}

export function modelStatusColor(status: ModelHealthStatus) {
  switch (status) {
    case 'available':
      return 'success';
    case 'rate_limited':
      return 'warning';
    case 'quota_exceeded':
      return 'warning';
    case 'not_configured':
      return 'gray';
    case 'unknown':
      return 'gray';
    case 'error':
      return 'error';
  }
}
