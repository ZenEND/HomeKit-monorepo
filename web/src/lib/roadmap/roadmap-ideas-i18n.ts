import type { Language } from '@/lib/i18n/i18n-store';
import type {
  BackendLearningItem,
  FreeLlmOption,
  GameIdea,
  VisionPrinciple,
} from './roadmap-ideas';

const visionUa: Record<string, Pick<VisionPrinciple, 'title' | 'description'>> = {
  'fun-first': {
    title: 'Спершу весело',
    description:
      'Якщо друзі не сміються на дивані — фіча не готова. Кожна ідея починається з ігрового вечора або вечері, а не з технодемо.',
  },
  'learn-by-building': {
    title: 'Навчання через створення',
    description:
      'Кожна фаза навчає реальних бекенд-навичок — auth, WebSockets, черги, файли, LLM API — через фічі, якими ти користуєшся.',
  },
  'zero-to-low-cost': {
    title: 'Нуль або мінімум витрат',
    description:
      'Self-hosted на твоїй машині, безкоштовні LLM локально або на щедрих free tier. Жодних підписок, щоб грати.',
  },
  'private-by-default': {
    title: 'Приватність за замовчуванням',
    description:
      'Дані лишаються у твоїй мережі. Друзі заходять через QR-запрошення з доступом до конкретних сторінок — не публічний SaaS.',
  },
};

const gamesUa: Record<string, Pick<GameIdea, 'name' | 'tagline' | 'backendSkill' | 'targetPhase'>> = {
  crocodile: {
    name: 'Крокодил',
    tagline: 'Поясни слово, не називаючи його — класичний режим для вечірки',
    backendSkill: 'REST-кімнати, стейт-машина ходу, таймери',
    targetPhase: 'Вер 2026',
  },
  alias: {
    name: 'Аліас',
    tagline: 'Команди наввипередки вгадують слова за підказками до кінця таймера',
    backendSkill: 'Командний рахунок, пакети раундів, API словників',
    targetPhase: 'Жов 2026',
  },
  mafia: {
    name: 'Мафія / Перевертні',
    tagline: 'Приховані ролі, день/ніч, звинувачення та голосування',
    backendSkill: 'WebSockets, приватні канали ролей, оркестрація фаз',
    targetPhase: 'Лис 2026',
  },
  quiz: {
    name: 'Вечір вікторин',
    tagline: 'Кастомні раунди — фільми, меми, внутрішні жарти',
    backendSkill: 'Генерація питань LLM, перевірка відповідей, таблиці лідерів',
    targetPhase: 'Лис 2026',
  },
  'draw-guess': {
    name: 'Малюй і вгадуй',
    tagline: 'Малюнок на телефоні, інші вгадують — хаотично й смішно',
    backendSkill: 'Синхронізація canvas через WebSocket, події мазків',
    targetPhase: 'Лис 2026',
  },
  'codenames-lite': {
    name: 'Codenames-lite',
    tagline: 'Підказки з одного слова для сітки карток — шпигунська тема опційна',
    backendSkill: 'Генерація сітки, перевірка підказок, логіка ходів команд',
    targetPhase: 'Гру 2026',
  },
  'would-you-rather': {
    name: 'Що б ти обрав',
    tagline: 'Абсурдні дилеми — голосуйте й дивіться вибір групи',
    backendSkill: 'LLM-шаблони промптів, агрегація голосів, екран результатів',
    targetPhase: 'Гру 2026',
  },
  charades: {
    name: 'Шаради+',
    tagline: 'Показуй без слів, нахиляй телефон для пропуску — без паперу й ручки',
    backendSkill: 'Підказки акселерометра, словники, синхронізація рахунку',
    targetPhase: 'Січ 2027',
  },
  'two-truths': {
    name: 'Дві правди й брехня',
    tagline: 'Персональні раунди про компанію — добре для нових друзів',
    backendSkill: 'Флоу відповідей, анонімне голосування, послідовне відкриття',
    targetPhase: 'Січ 2027',
  },
  'hot-takes': {
    name: 'Гарячі думки',
    tagline: 'Суперечливі думки — погоджуйтесь або сперечайтесь',
    backendSkill: 'LLM-генерація тем з safety-фільтрами, підрахунок реакцій',
    targetPhase: 'Лют 2027',
  },
  'movie-bingo': {
    name: 'Кінобінго',
    tagline: 'Відмічай тропи під час фільму — крик Вільгельма, plot twist, драматичний дощ',
    backendSkill: 'Генерація bingo-карток, прогрес кожного, live reveal state',
    targetPhase: 'Лют 2027',
  },
  'trailer-guess': {
    name: 'Вгадай за трейлером',
    tagline: 'Дивіться трейлер без назви й вгадуйте фільм або серіал',
    backendSkill: 'API метаданих медіа, spoiler-safe підказки, timed answer lock',
    targetPhase: 'Лют 2027',
  },
  'episode-recap': {
    name: 'Квіз після серії',
    tagline: 'Після епізоду перевірте, хто помітив найменші деталі',
    backendSkill: 'Пакети питань, сесії за епізодами, збереження scoreboard',
    targetPhase: 'Бер 2027',
  },
  'plot-predictions': {
    name: 'Прогнози сюжету',
    tagline: 'Пауза перед фіналом: прогнозуйте смерті, твісти, пари й зради',
    backendSkill: 'Приватні відповіді, таймлайн reveal, engine правил для балів',
    targetPhase: 'Бер 2027',
  },
  'soundtrack-challenge': {
    name: 'Саундтрек-челендж',
    tagline: 'Вгадай фільм або серіал за темою чи музичною підказкою',
    backendSkill: 'Плейлисти раундів, аудіо-підказки, matching відповідей',
    targetPhase: 'Бер 2027',
  },
  'watch-party-sync': {
    name: 'Синхронний watch-party',
    tagline: 'Усі одночасно натискають play, реагують і голосують, що дивитися далі',
    backendSkill: 'Presence, синхронізовані таймери, reaction events, polls',
    targetPhase: 'Кві 2027',
  },
};

const backendUa: Record<string, Pick<BackendLearningItem, 'topic' | 'why' | 'usedIn'>> = {
  'nestjs-modules': {
    topic: 'Модулі NestJS і DTO',
    why: 'Структура швидко росте з іграми, сховищем і auth',
    usedIn: 'Кожна API-фаза',
  },
  'jwt-rbac': {
    topic: 'JWT + рольовий доступ',
    why: 'Власник / партнерка / друг з посторінковими правами',
    usedIn: 'Доступ і ролі, QR-запрошення',
  },
  websockets: {
    topic: 'WebSockets (Socket.io або ws)',
    why: 'Живий стан ігор, синхронізація малюнків, нічна фаза Мафії',
    usedIn: 'Мафія, Малюй і вгадуй, real-time lobby',
  },
  redis: {
    topic: 'Redis pub/sub і кешування',
    why: 'Стан кімнат, rate limits, session store',
    usedIn: 'Ігрові кімнати, кеш відповідей LLM',
  },
  postgres: {
    topic: 'Postgres + звʼязки TypeORM',
    why: 'Користувачі, запрошення, рахунки, метадані файлів',
    usedIn: 'Auth, сховище, таблиці лідерів',
  },
  'file-io': {
    topic: 'Multer + дискові томи + мініатюри',
    why: 'Справжнє сховище фото на локальному сервері',
    usedIn: 'Фаза сховища файлів',
  },
  'llm-api': {
    topic: 'Інтеграція LLM API + fallback-и',
    why: 'Генерація слів/вікторин з офлайн JSON-резервом',
    usedIn: 'Аліас, Вікторина, Гарячі думки',
  },
  'pwa-sync': {
    topic: 'Service workers і фонова синхронізація',
    why: 'Ігри працюють навіть коли домашній Wi-Fi блимає',
    usedIn: 'Offline-first PWA',
  },
};

const llmUa: Record<string, Pick<FreeLlmOption, 'name' | 'cost' | 'bestFor' | 'notes'>> = {
  ollama: {
    name: 'Ollama (локально)',
    cost: 'Безкоштовно — працює на Mac/сервері',
    bestFor: 'Пакети слів, питання вікторини, гарячі думки — дані не виходять з дому',
    notes: 'Використовуй Llama 3.2, Mistral або Phi-3. Найкращий дефолт для HomeKit. Нуль рахунків за API.',
  },
  groq: {
    name: 'Безкоштовний tier Groq Cloud',
    cost: 'Free tier з лімітами',
    bestFor: 'Швидкий inference, коли локальний GPU слабкий',
    notes: 'Моделі Llama/Mixtral. Добре для пікових ігрових раундів. Додай fallback на Ollama.',
  },
  gemini: {
    name: 'Google Gemini API',
    cost: 'Щедрий free tier (перевір актуальні ліміти)',
    bestFor: 'Креативні списки слів і вікторини, коли є інтернет',
    notes: 'Gemini Flash швидкий і дешевий. Кешуй відповіді в Redis, щоб мінімізувати виклики.',
  },
  'openrouter-free': {
    name: 'Безкоштовні моделі OpenRouter',
    cost: 'Є безкоштовні маршрути моделей',
    bestFor: 'Експерименти з різними моделями без зобовʼязань',
    notes: 'Обирай моделі з тегом `:free`. Обгорни провайдером, щоб перемикання було одним env var.',
  },
  'json-banks': {
    name: 'Кураторські JSON-банки слів',
    cost: 'Завжди безкоштовно — LLM не потрібна',
    bestFor: 'Офлайн-ігрові вечори, нульова затримка, 100% надійність',
    notes: 'Спершу ship зі статичними пакетами (фільми, тварини, дім). LLM — опційна спеція.',
  },
};

export const llmStrategyNoteUa =
  'Рекомендований стек: почни з JSON-банків слів + локальної Ollama. Додай Groq або Gemini як онлайн-підсилення. Ніколи не став ігровий вечір у залежність від платного API.';

export function localizeVisionPrinciple(item: VisionPrinciple, language: Language): VisionPrinciple {
  return language === 'ua' && visionUa[item.id] ? { ...item, ...visionUa[item.id] } : item;
}

export function localizeGameIdea(item: GameIdea, language: Language): GameIdea {
  return language === 'ua' && gamesUa[item.id] ? { ...item, ...gamesUa[item.id] } : item;
}

export function localizeBackendItem(item: BackendLearningItem, language: Language): BackendLearningItem {
  return language === 'ua' && backendUa[item.id] ? { ...item, ...backendUa[item.id] } : item;
}

export function localizeLlmOption(item: FreeLlmOption, language: Language): FreeLlmOption {
  return language === 'ua' && llmUa[item.id] ? { ...item, ...llmUa[item.id] } : item;
}
