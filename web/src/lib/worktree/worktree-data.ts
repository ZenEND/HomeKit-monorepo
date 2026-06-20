// A "work tree" of improvement variants — branches of how the project could grow.
// Each branch has variants you can pick from, with effort, impact, and what you'd learn.

export type Impact = 'low' | 'medium' | 'high';
export type Effort = 'low' | 'medium' | 'high';

export interface WorktreeVariant {
  id: string;
  title: string;
  description: string;
  impact: Impact;
  effort: Effort;
  learn: string;
  recommended?: boolean;
}

export interface WorktreeBranch {
  id: string;
  area: string;
  emoji: string;
  goal: string;
  variants: WorktreeVariant[];
}

export const worktreeBranches: WorktreeBranch[] = [
  {
    id: 'backend',
    area: 'Backend Architecture',
    emoji: '🧱',
    goal: 'Make the API robust enough for real-time games and many users.',
    variants: [
      {
        id: 'be-monolith',
        title: 'Stay modular monolith',
        description: 'Keep one NestJS app with clean modules (auth, games, files, plans).',
        impact: 'medium',
        effort: 'low',
        learn: 'NestJS modules, dependency injection, clean boundaries',
        recommended: true,
      },
      {
        id: 'be-ws',
        title: 'Add WebSocket gateway',
        description: 'Real-time rooms for Mafia, Draw & Guess, and live F1 positions.',
        impact: 'high',
        effort: 'medium',
        learn: 'Socket.io gateways, rooms, presence, reconnect handling',
      },
      {
        id: 'be-queue',
        title: 'Add a job queue (BullMQ)',
        description: 'Background jobs for thumbnails, LLM calls, and scrapers.',
        impact: 'medium',
        effort: 'medium',
        learn: 'Redis-backed queues, workers, retries, scheduling',
      },
      {
        id: 'be-micro',
        title: 'Split into microservices',
        description: 'Separate game, media, and auth services. Overkill for now.',
        impact: 'low',
        effort: 'high',
        learn: 'Message brokers, service discovery, distributed tracing',
      },
    ],
  },
  {
    id: 'data',
    area: 'Data & Storage',
    emoji: '🗄️',
    goal: 'Move from mocks to durable, queryable data.',
    variants: [
      {
        id: 'data-typeorm',
        title: 'TypeORM + Postgres relations',
        description: 'Model users, invites, events, scores, file metadata properly.',
        impact: 'high',
        effort: 'medium',
        learn: 'Entity relations, migrations, query builder',
        recommended: true,
      },
      {
        id: 'data-redis',
        title: 'Redis for hot state & cache',
        description: 'Game room state, LLM/F1 response cache, rate limits.',
        impact: 'high',
        effort: 'low',
        learn: 'Caching strategies, TTLs, pub/sub',
      },
      {
        id: 'data-files',
        title: 'Disk volumes + thumbnails',
        description: 'Real photo/video storage with generated previews.',
        impact: 'medium',
        effort: 'medium',
        learn: 'Streaming uploads, sharp, volume mounts',
      },
    ],
  },
  {
    id: 'ai',
    area: 'AI & Content',
    emoji: '🤖',
    goal: 'Generate words, quizzes, and party prompts for free.',
    variants: [
      {
        id: 'ai-ollama',
        title: 'Local Ollama provider',
        description: 'Run Llama/Mistral locally — zero API cost, full privacy.',
        impact: 'high',
        effort: 'medium',
        learn: 'Local LLM serving, prompt templates, streaming',
        recommended: true,
      },
      {
        id: 'ai-json',
        title: 'Curated JSON banks',
        description: 'Ship static word/quiz packs as a reliable offline baseline.',
        impact: 'medium',
        effort: 'low',
        learn: 'Content modeling, seeding, versioned data',
      },
      {
        id: 'ai-freetier',
        title: 'Free cloud tiers as boost',
        description: 'Groq / Gemini free tiers behind a provider interface.',
        impact: 'medium',
        effort: 'low',
        learn: 'Provider abstraction, fallbacks, rate-limit handling',
      },
    ],
  },
  {
    id: 'frontend',
    area: 'Frontend Experience',
    emoji: '🎨',
    goal: 'Keep it beautiful, fast, and installable.',
    variants: [
      {
        id: 'fe-pwa',
        title: 'Offline-first PWA',
        description: 'Service worker, install prompt, cached games and menus.',
        impact: 'high',
        effort: 'medium',
        learn: 'Service workers, background sync, manifests',
        recommended: true,
      },
      {
        id: 'fe-split',
        title: 'Route-based code splitting',
        description: 'Lazy-load pages to shrink the 1.1MB bundle warning.',
        impact: 'medium',
        effort: 'low',
        learn: 'React.lazy, Suspense, Vite manualChunks',
      },
      {
        id: 'fe-realtime',
        title: 'Real-time UI hooks',
        description: 'Live scoreboards and positions via WebSocket subscriptions.',
        impact: 'medium',
        effort: 'medium',
        learn: 'WS client state, optimistic updates, Zustand sync',
      },
    ],
  },
  {
    id: 'ops',
    area: 'DevOps & Quality',
    emoji: '🛠️',
    goal: 'Ship confidently from your home server.',
    variants: [
      {
        id: 'ops-ci',
        title: 'CI pipeline (lint, test, build)',
        description: 'GitHub Actions on every push and PR.',
        impact: 'high',
        effort: 'low',
        learn: 'CI workflows, caching, matrix builds',
        recommended: true,
      },
      {
        id: 'ops-tests',
        title: 'Test coverage',
        description: 'Vitest for web, Jest + e2e for the NestJS API.',
        impact: 'medium',
        effort: 'medium',
        learn: 'Unit/integration tests, mocking, e2e',
      },
      {
        id: 'ops-observability',
        title: 'Logging & metrics',
        description: 'Structured logs, health checks, simple dashboards.',
        impact: 'medium',
        effort: 'medium',
        learn: 'Pino, Prometheus, Grafana basics',
      },
      {
        id: 'ops-deploy',
        title: 'One-command home deploy',
        description: 'Reproducible Docker deploy with exposed-port hardening.',
        impact: 'high',
        effort: 'medium',
        learn: 'Compose profiles, reverse proxy, TLS, secrets',
      },
    ],
  },
];

export function badgeForImpact(impact: Impact): 'success' | 'warning' | 'gray' {
  return impact === 'high' ? 'success' : impact === 'medium' ? 'warning' : 'gray';
}

export function badgeForEffort(effort: Effort): 'success' | 'warning' | 'error' {
  return effort === 'low' ? 'success' : effort === 'medium' ? 'warning' : 'error';
}

const branchesUa: Record<string, Pick<WorktreeBranch, 'area' | 'goal'>> = {
  backend: {
    area: 'Архітектура бекенду',
    goal: 'Зробити API достатньо надійним для real-time ігор і багатьох користувачів.',
  },
  data: {
    area: 'Дані та сховище',
    goal: 'Перейти від моків до надійних даних, які можна запитувати й зберігати.',
  },
  ai: {
    area: 'AI та контент',
    goal: 'Генерувати слова, вікторини й party-промпти безкоштовно.',
  },
  frontend: {
    area: 'Фронтенд-досвід',
    goal: 'Зробити застосунок красивим, швидким і встановлюваним.',
  },
  ops: {
    area: 'DevOps і якість',
    goal: 'Впевнено деплоїти на домашній сервер.',
  },
};

const variantsUa: Record<string, Pick<WorktreeVariant, 'title' | 'description' | 'learn'>> = {
  'be-monolith': {
    title: 'Лишитися модульним монолітом',
    description: 'Один NestJS застосунок із чистими модулями (auth, games, files, plans).',
    learn: 'Модулі NestJS, dependency injection, чисті межі',
  },
  'be-ws': {
    title: 'Додати WebSocket gateway',
    description: 'Real-time кімнати для Мафії, Малюй і вгадуй та живих F1-позицій.',
    learn: 'Socket.io gateways, rooms, presence, reconnect handling',
  },
  'be-queue': {
    title: 'Додати чергу задач (BullMQ)',
    description: 'Фонові задачі для мініатюр, LLM-викликів і скраперів.',
    learn: 'Redis-черги, workers, retries, scheduling',
  },
  'be-micro': {
    title: 'Розділити на мікросервіси',
    description: 'Окремі сервіси для ігор, медіа й auth. Поки що overkill.',
    learn: 'Message brokers, service discovery, distributed tracing',
  },
  'data-typeorm': {
    title: 'TypeORM + Postgres relations',
    description: 'Нормально змоделювати користувачів, запрошення, події, рахунки й метадані файлів.',
    learn: 'Entity relations, migrations, query builder',
  },
  'data-redis': {
    title: 'Redis для гарячого стану й кешу',
    description: 'Стан ігрових кімнат, кеш LLM/F1, rate limits.',
    learn: 'Стратегії кешування, TTL, pub/sub',
  },
  'data-files': {
    title: 'Дискові томи + мініатюри',
    description: 'Справжнє сховище фото/відео з превʼю.',
    learn: 'Streaming uploads, sharp, volume mounts',
  },
  'ai-ollama': {
    title: 'Локальний провайдер Ollama',
    description: 'Запуск Llama/Mistral локально — нуль витрат на API і повна приватність.',
    learn: 'Локальний LLM-сервер, prompt templates, streaming',
  },
  'ai-json': {
    title: 'Кураторські JSON-банки',
    description: 'Статичні пакети слів/вікторин як надійна офлайн-база.',
    learn: 'Моделювання контенту, seeding, versioned data',
  },
  'ai-freetier': {
    title: 'Free cloud tiers як підсилення',
    description: 'Groq / Gemini free tiers за provider interface.',
    learn: 'Provider abstraction, fallbacks, rate-limit handling',
  },
  'fe-pwa': {
    title: 'Offline-first PWA',
    description: 'Service worker, install prompt, кешовані ігри й меню.',
    learn: 'Service workers, background sync, manifests',
  },
  'fe-split': {
    title: 'Code splitting за маршрутами',
    description: 'Lazy-load сторінок, щоб прибрати warning про 1.1MB bundle.',
    learn: 'React.lazy, Suspense, Vite manualChunks',
  },
  'fe-realtime': {
    title: 'Real-time UI hooks',
    description: 'Живі scoreboard-и та позиції через WebSocket subscriptions.',
    learn: 'WS client state, optimistic updates, Zustand sync',
  },
  'ops-ci': {
    title: 'CI pipeline (lint, test, build)',
    description: 'GitHub Actions на кожен push і PR.',
    learn: 'CI workflows, caching, matrix builds',
  },
  'ops-tests': {
    title: 'Покриття тестами',
    description: 'Vitest для web, Jest + e2e для NestJS API.',
    learn: 'Unit/integration tests, mocking, e2e',
  },
  'ops-observability': {
    title: 'Логи та метрики',
    description: 'Структуровані логи, health checks, прості dashboards.',
    learn: 'Pino, Prometheus, базовий Grafana',
  },
  'ops-deploy': {
    title: 'Домашній deploy однією командою',
    description: 'Відтворюваний Docker deploy із захистом відкритих портів.',
    learn: 'Compose profiles, reverse proxy, TLS, secrets',
  },
};

export function localizeWorktreeBranch(branch: WorktreeBranch, language: 'en' | 'ua'): WorktreeBranch {
  if (language !== 'ua') return branch;
  return {
    ...branch,
    ...(branchesUa[branch.id] ?? {}),
    variants: branch.variants.map((variant) => localizeWorktreeVariant(variant, language)),
  };
}

export function localizeWorktreeVariant(variant: WorktreeVariant, language: 'en' | 'ua'): WorktreeVariant {
  return language === 'ua' && variantsUa[variant.id] ? { ...variant, ...variantsUa[variant.id] } : variant;
}
