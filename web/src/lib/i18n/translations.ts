import type { Language } from './i18n-store';

export type TranslationValues = Record<string, string | number>;

interface Dictionary {
  [key: string]: string;
}

const en: Dictionary = {
  'app.title': 'HomeKit',
  'app.tagline': 'A private home for you, your partner, and friends.',

  'nav.home': 'Home',
  'nav.storage': 'Storage',
  'nav.games': 'Games',
  'nav.f1': 'F1',
  'nav.parties': 'Parties',
  'nav.plans': 'Plans',
  'nav.food': 'Food',
  'nav.invite': 'Invite',
  'nav.development': 'Development',
  'nav.roadmap': 'Roadmap',
  'nav.worktree': 'Work Tree',
  'nav.components': 'Components',
  'nav.login': 'Login',

  'language.label': 'Language',

  'development.title': 'Development Hub',
  'development.subtitle':
    'Internal project pages for planning, implementation choices, and UI component checks.',

  'roadmap.title': 'HomeKit Roadmap',
  'roadmap.subtitle':
    'Fun first, learn by building. Party games on your couch, backend skills in your head, zero subscription bills — monthly milestones below.',
  'roadmap.overallProgress': 'Overall progress',
  'roadmap.stepsSummary': '{completed} of {total} steps',
  'roadmap.stepsSummaryDot': '{completed} of {total} steps · {percent}%',
  'roadmap.principlesTitle': 'Principles',
  'roadmap.gameCatalogTitle': 'Game catalog',
  'roadmap.gameCatalogSubtitle':
    '16 party games planned — including movie nights, series quizzes, and watch-party mechanics. Each one teaches a backend skill while friends laugh.',
  'roadmap.learnLabel': 'Learn',
  'roadmap.backendTitle': 'Backend learning track',
  'roadmap.backendSubtitle': "Skills you pick up while shipping features — not abstract tutorials.",
  'roadmap.usedInLabel': 'Used in',
  'roadmap.llmTitle': 'Free LLM stack',
  'roadmap.milestonesTitle': 'Monthly milestones',
  'roadmap.filterByStatus': 'Filter by status',
  'roadmap.statusAll': 'All',
  'roadmap.statusCompleted': 'Completed',
  'roadmap.statusInProgress': 'In progress',
  'roadmap.statusPlanned': 'Planned',
  'roadmap.noPhases': 'No phases match this filter.',

  'common.all': 'All',
  'common.low': 'Low',
  'common.medium': 'Medium',
  'common.high': 'High',
  'common.people': 'people',
  'common.learn': 'Learn',
  'common.impact': 'impact',
  'common.effort': 'effort',

  'home.eyebrow': 'Private home app',
  'home.title': 'Everything for your home circle in one place.',
  'home.subtitle':
    'HomeKit keeps plans, games, files, food ideas, and invites behind a private login for people you trust.',
  'home.login': 'Login',
  'home.signUp': 'Sign up',
  'home.scanQr': 'Scan QR',
  'home.cardLabel': 'Protected by default',
  'home.cardTitle': 'Your pages stay private',
  'home.cardDescription':
    'Login opens the main HomeKit workspace with storage, games, plans, invites, and development pages.',

  'games.coming': 'Coming Sep 2026',
  'games.title': 'Party Games',
  'games.subtitle':
    'Couch-first games for friends — phones as controllers, your HomeKit server as host. Built for laughs first, backend learning second.',
  'games.viewRoadmap': 'View full roadmap',
  'games.planned': 'Planned games',
  'games.backendSkill': 'Backend skill',
  'games.freeLlm': 'Free LLM for word generation',
  'games.firstPlayablePrefix': 'First playable game:',
  'games.firstPlayableSuffix':
    'in Sep 2026 — static word packs, no LLM required. Alias with Ollama follows in Oct.',
  'games.seeBackendTrack': 'See backend learning track on the roadmap ->',

  'f1.title': 'Formula 1 Fun',
  'f1.subtitle':
    'Track the season with friends — calendar, the grid, championship standings, and latest race results. Perfect for race-day watch parties on the HomeKit screen.',
  'f1.nextRace': 'Next race',
  'f1.tracks': 'Tracks',
  'f1.grid': 'Grid',
  'f1.positions': 'Positions',
  'f1.dataSources': 'Data sources',
  'f1.seasonProgress': 'Season progress',
  'f1.racesProgress': '{completed} of {total} races · {percent}%',
  'f1.done': 'Done',
  'f1.next': 'Next',
  'f1.upcoming': 'Upcoming',
  'f1.laps': 'laps',
  'f1.driverStandings': 'Driver standings',
  'f1.constructorStandings': 'Constructor standings',
  'f1.win': 'win',
  'f1.wins': 'wins',
  'f1.points': 'pts',
  'f1.latestResult': 'Latest result',
  'f1.fastestLap': 'Fastest lap',
  'f1.dataIntro':
    'This page uses mock data. Wire it to a free source below — recommended path is an API first, with a scraper as fallback. Cache responses in Redis and serve through a NestJS module.',
  'f1.api': 'API',
  'f1.scraper': 'Scraper',

  'parties.title': 'Party Ideas',
  'parties.subtitle':
    'Ready-to-run plans for hanging out — each one explains the vibe, how to run it, and which HomeKit pages make it easy. Pick by effort level and go.',
  'parties.filter': 'Filter by effort',
  'parties.howItWorks': 'How it works',
  'parties.tieIn': 'HomeKit tie-in',
  'parties.lowEffort': 'Low effort',
  'parties.mediumEffort': 'Medium effort',
  'parties.highEffort': 'High effort',

  'plans.title': 'Plans',
  'plans.subtitle':
    'Upcoming hangouts grouped by location. Game nights, dinners, watch parties, and trips — see what is happening near you and who is going.',
  'plans.view': 'View',
  'plans.byLocation': 'By location',
  'plans.timeline': 'Timeline',
  'plans.category': 'Category',
  'plans.games': 'Games',
  'plans.dinner': 'Dinner',
  'plans.outdoor': 'Outdoor',
  'plans.watch': 'Watch',
  'plans.hostedBy': 'Hosted by',
  'plans.goingMaybe': '{going} going · {maybe} maybe',
  'plans.event': 'event',
  'plans.events': 'events',
  'plans.noEvents': 'No events match this filter.',
  'plans.sourcesTitle': 'Where to find new films and series',
  'plans.sourcesSubtitle':
    'Use these sources to plan watch sessions, discover upcoming releases, and later wire a HomeKit movie API.',
  'plans.bestFor': 'Best for',
  'plans.calendar': 'Calendar',
  'plans.database': 'Database',
  'plans.tracker': 'Tracker',
  'plans.news': 'News',

  'worktree.title': 'Work Tree',
  'worktree.subtitle':
    "Branches of how the project can grow. Each area lists variants with impact, effort, and what you'd learn — pick a path per area and build it. Starred options are the recommended next step.",
  'worktree.pick': 'Pick',
  'worktree.variants': 'variants',

  'comingSoon.target': 'Target',
  'comingSoon.viewRoadmap': 'View roadmap',

  'food.title': 'Food Ordering',
  'food.description':
    'A shared menu to organize meals with your partner and friends — no delivery integration, just a simple way to decide who wants what.',
  'food.feature1': 'Shared menu with categories and items',
  'food.feature2': 'Per-person order cart',
  'food.feature3': 'Summary view: who ordered what',
  'food.feature4': 'Order history and favorite items',

  'invite.title': 'Invite by QR',
  'invite.description':
    'Generate time-limited invite links and QR codes so your partner and friends can join specific pages on your private HomeKit server.',
  'invite.feature1': 'Generate invite tokens with expiry',
  'invite.feature2': 'QR code for scan-to-join on mobile',
  'invite.feature3': 'Per-page access grants (games, storage, food)',
  'invite.feature4': 'Invite management and revocation',

  'login.title': 'Welcome back',
  'login.subtitle': 'Sign in to your HomeKit account to continue.',
  'login.email': 'Email',
  'login.emailPlaceholder': 'you@example.com',
  'login.password': 'Password',
  'login.passwordPlaceholder': 'Enter your password',
  'login.remember': 'Remember me',
  'login.rememberHint': 'Save my login details for next time',
  'login.error': 'Something went wrong. Please try again.',
  'login.signIn': 'Sign in',
  'login.noAccount': "Don't have an account?",
  'login.signUp': 'Sign up',
  'login.emailRequired': 'Email is required',
  'login.emailInvalid': 'Please enter a valid email address',
  'login.passwordRequired': 'Password is required',
  'login.passwordMin': 'Password must be at least 8 characters',

  'notFound.title': 'Page not found',
  'notFound.description':
    "Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.",
  'notFound.back': 'Back to home',

  'about.title': 'About',
  'about.description':
    'This frontend uses React, Vite, TypeScript, Zustand, React Router, Sass, and PostCSS modules.',

  'storage.title': 'File storage',
  'storage.subtitle': 'Upload, organize, and browse files on your local HomeKit server.',
  'storage.upload': 'Upload',
  'storage.folders': 'Folders',
  'storage.newFolder': 'New folder',
  'storage.newFolderName': 'New folder name',
  'storage.createFolder': 'Create folder',
  'storage.search': 'Search files...',
  'storage.searchLabel': 'Search files',
  'storage.filterType': 'Filter type',
  'storage.allTypes': 'All types',
  'storage.images': 'Images',
  'storage.documents': 'Documents',
  'storage.videos': 'Videos',
  'storage.other': 'Other',
  'storage.gridView': 'Grid view',
  'storage.listView': 'List view',
  'storage.loading': 'Loading files...',
  'storage.emptyTitle': 'No files yet',
  'storage.emptyDescription':
    'Upload photos and documents using the button above, or drag and drop into the upload panel.',
  'storage.deleteFile': 'Delete {name}',
  'upload.drop': 'Drop files here or click to browse',
  'upload.paste': 'Paste images from clipboard (Ctrl+V)',
  'crop.title': 'Crop image',
  'crop.description': 'Adjust the crop area before uploading.',
  'crop.zoom': 'Zoom',
  'crop.free': 'Free',
  'crop.cancel': 'Cancel',
  'crop.upload': 'Upload cropped',
};

const ua: Dictionary = {
  'app.title': 'HomeKit',
  'app.tagline': 'Приватний дім для тебе, твоєї половинки та друзів.',

  'nav.home': 'Головна',
  'nav.storage': 'Сховище',
  'nav.games': 'Ігри',
  'nav.f1': 'Ф1',
  'nav.parties': 'Вечірки',
  'nav.plans': 'Плани',
  'nav.food': 'Їжа',
  'nav.invite': 'Запрошення',
  'nav.development': 'Розробка',
  'nav.roadmap': 'Дорожня карта',
  'nav.worktree': 'Дерево робіт',
  'nav.components': 'Компоненти',
  'nav.login': 'Вхід',

  'language.label': 'Мова',

  'development.title': 'Центр розробки',
  'development.subtitle':
    'Внутрішні сторінки проєкту для планування, вибору реалізації та перевірки UI-компонентів.',

  'roadmap.title': 'Дорожня карта HomeKit',
  'roadmap.subtitle':
    'Спершу весело, навчання через створення. Ігри для компанії на дивані, бекенд-навички в голові, нуль підписок — щомісячні етапи нижче.',
  'roadmap.overallProgress': 'Загальний прогрес',
  'roadmap.stepsSummary': '{completed} з {total} кроків',
  'roadmap.stepsSummaryDot': '{completed} з {total} кроків · {percent}%',
  'roadmap.principlesTitle': 'Принципи',
  'roadmap.gameCatalogTitle': 'Каталог ігор',
  'roadmap.gameCatalogSubtitle':
    '16 ігор для компанії — включно з кіновечорами, квізами по серіалах і watch-party механіками. Кожна навчає бекенд-навичці, поки друзі сміються.',
  'roadmap.learnLabel': 'Навчишся',
  'roadmap.backendTitle': 'Трек вивчення бекенду',
  'roadmap.backendSubtitle': 'Навички, які здобуваєш, випускаючи фічі — а не абстрактні туторіали.',
  'roadmap.usedInLabel': 'Де використовується',
  'roadmap.llmTitle': 'Безкоштовний стек LLM',
  'roadmap.milestonesTitle': 'Щомісячні етапи',
  'roadmap.filterByStatus': 'Фільтр за статусом',
  'roadmap.statusAll': 'Усі',
  'roadmap.statusCompleted': 'Завершено',
  'roadmap.statusInProgress': 'У процесі',
  'roadmap.statusPlanned': 'Заплановано',
  'roadmap.noPhases': 'Немає етапів за цим фільтром.',

  'common.all': 'Усі',
  'common.low': 'Низька',
  'common.medium': 'Середня',
  'common.high': 'Висока',
  'common.people': 'людей',
  'common.learn': 'Навчишся',
  'common.impact': 'вплив',
  'common.effort': 'зусилля',

  'home.eyebrow': 'Приватний домашній застосунок',
  'home.title': 'Усе для твого домашнього кола в одному місці.',
  'home.subtitle':
    'HomeKit тримає плани, ігри, файли, ідеї для їжі та запрошення за приватним входом для людей, яким ти довіряєш.',
  'home.login': 'Увійти',
  'home.signUp': 'Зареєструватися',
  'home.scanQr': 'Сканувати QR',
  'home.cardLabel': 'Приватність за замовчуванням',
  'home.cardTitle': 'Твої сторінки залишаються закритими',
  'home.cardDescription':
    'Вхід відкриває основний простір HomeKit зі сховищем, іграми, планами, запрошеннями та сторінками розробки.',

  'games.coming': 'Очікується у вересні 2026',
  'games.title': 'Ігри для компанії',
  'games.subtitle':
    'Диванні ігри для друзів — телефони як контролери, твій HomeKit-сервер як хост. Спершу сміх, потім бекенд-навчання.',
  'games.viewRoadmap': 'Переглянути дорожню карту',
  'games.planned': 'Заплановані ігри',
  'games.backendSkill': 'Бекенд-навичка',
  'games.freeLlm': 'Безкоштовна LLM для генерації слів',
  'games.firstPlayablePrefix': 'Перша готова гра:',
  'games.firstPlayableSuffix':
    'у вересні 2026 — статичні набори слів, LLM не потрібна. Аліас з Ollama буде у жовтні.',
  'games.seeBackendTrack': 'Подивитися бекенд-трек на дорожній карті ->',

  'f1.title': 'Формула 1 для фанів',
  'f1.subtitle':
    'Стеж за сезоном з друзями — календар, стартова решітка, чемпіонський залік і останні результати. Ідеально для перегляду гонок на екрані HomeKit.',
  'f1.nextRace': 'Наступна гонка',
  'f1.tracks': 'Траси',
  'f1.grid': 'Решітка',
  'f1.positions': 'Позиції',
  'f1.dataSources': 'Джерела даних',
  'f1.seasonProgress': 'Прогрес сезону',
  'f1.racesProgress': '{completed} з {total} гонок · {percent}%',
  'f1.done': 'Готово',
  'f1.next': 'Наступна',
  'f1.upcoming': 'Попереду',
  'f1.laps': 'кіл',
  'f1.driverStandings': 'Залік пілотів',
  'f1.constructorStandings': 'Залік конструкторів',
  'f1.win': 'перемога',
  'f1.wins': 'перемог',
  'f1.points': 'оч.',
  'f1.latestResult': 'Останній результат',
  'f1.fastestLap': 'Найшвидше коло',
  'f1.dataIntro':
    'Ця сторінка використовує мок-дані. Підключи її до безкоштовного джерела нижче — рекомендований шлях: спочатку API, а скрапер як резерв. Кешуй відповіді в Redis і віддавай через модуль NestJS.',
  'f1.api': 'API',
  'f1.scraper': 'Скрапер',

  'parties.title': 'Ідеї для вечірок',
  'parties.subtitle':
    'Готові плани для зустрічей — кожен пояснює атмосферу, як усе провести і які сторінки HomeKit допомагають. Обери за рівнем зусиль і стартуй.',
  'parties.filter': 'Фільтр за зусиллями',
  'parties.howItWorks': 'Як це працює',
  'parties.tieIn': 'Звʼязок з HomeKit',
  'parties.lowEffort': 'Мало зусиль',
  'parties.mediumEffort': 'Середні зусилля',
  'parties.highEffort': 'Багато зусиль',

  'plans.title': 'Плани',
  'plans.subtitle':
    'Майбутні зустрічі, згруповані за локаціями. Ігрові вечори, вечері, перегляди й поїздки — видно, що відбувається поруч і хто йде.',
  'plans.view': 'Вигляд',
  'plans.byLocation': 'За локацією',
  'plans.timeline': 'Хронологія',
  'plans.category': 'Категорія',
  'plans.games': 'Ігри',
  'plans.dinner': 'Вечеря',
  'plans.outdoor': 'На вулиці',
  'plans.watch': 'Перегляд',
  'plans.hostedBy': 'Організатор',
  'plans.goingMaybe': '{going} йдуть · {maybe} можливо',
  'plans.event': 'подія',
  'plans.events': 'подій',
  'plans.noEvents': 'Немає подій за цим фільтром.',
  'plans.sourcesTitle': 'Де шукати нові фільми та серіали',
  'plans.sourcesSubtitle':
    'Використовуй ці джерела для watch sessions, пошуку майбутніх релізів і майбутнього HomeKit movie API.',
  'plans.bestFor': 'Найкраще для',
  'plans.calendar': 'Календар',
  'plans.database': 'База даних',
  'plans.tracker': 'Трекер',
  'plans.news': 'Новини',

  'worktree.title': 'Дерево робіт',
  'worktree.subtitle':
    'Гілки розвитку проєкту. Кожен напрям має варіанти з впливом, зусиллями та тим, чого навчишся — обери шлях у кожній зоні й будуй. Позначені зіркою варіанти — рекомендований наступний крок.',
  'worktree.pick': 'Обрати',
  'worktree.variants': 'варіантів',

  'comingSoon.target': 'Ціль',
  'comingSoon.viewRoadmap': 'Переглянути дорожню карту',

  'food.title': 'Замовлення їжі',
  'food.description':
    'Спільне меню для організації їжі з партнеркою та друзями — без інтеграції доставки, просто зручний спосіб вирішити, хто що хоче.',
  'food.feature1': 'Спільне меню з категоріями та позиціями',
  'food.feature2': 'Кошик замовлення для кожного',
  'food.feature3': 'Підсумок: хто що замовив',
  'food.feature4': 'Історія замовлень і улюблені позиції',

  'invite.title': 'Запрошення через QR',
  'invite.description':
    'Генеруй тимчасові посилання-запрошення та QR-коди, щоб партнерка й друзі могли приєднуватися до конкретних сторінок приватного HomeKit-сервера.',
  'invite.feature1': 'Генерація токенів запрошення з терміном дії',
  'invite.feature2': 'QR-код для приєднання з телефону',
  'invite.feature3': 'Посторінковий доступ (ігри, сховище, їжа)',
  'invite.feature4': 'Керування запрошеннями та відкликання доступу',

  'login.title': 'З поверненням',
  'login.subtitle': 'Увійди до свого акаунта HomeKit, щоб продовжити.',
  'login.email': 'Email',
  'login.emailPlaceholder': 'you@example.com',
  'login.password': 'Пароль',
  'login.passwordPlaceholder': 'Введи пароль',
  'login.remember': 'Запамʼятати мене',
  'login.rememberHint': 'Зберегти дані входу для наступного разу',
  'login.error': 'Щось пішло не так. Спробуй ще раз.',
  'login.signIn': 'Увійти',
  'login.noAccount': 'Ще немає акаунта?',
  'login.signUp': 'Зареєструватися',
  'login.emailRequired': 'Email обовʼязковий',
  'login.emailInvalid': 'Введи коректну email-адресу',
  'login.passwordRequired': 'Пароль обовʼязковий',
  'login.passwordMin': 'Пароль має містити щонайменше 8 символів',

  'notFound.title': 'Сторінку не знайдено',
  'notFound.description':
    'Вибач, ми не знайшли сторінку, яку ти шукаєш. Можливо, її перемістили або видалили.',
  'notFound.back': 'На головну',

  'about.title': 'Про застосунок',
  'about.description':
    'Цей фронтенд використовує React, Vite, TypeScript, Zustand, React Router, Sass і PostCSS modules.',

  'storage.title': 'Сховище файлів',
  'storage.subtitle': 'Завантажуй, організовуй і переглядай файли на локальному сервері HomeKit.',
  'storage.upload': 'Завантажити',
  'storage.folders': 'Папки',
  'storage.newFolder': 'Нова папка',
  'storage.newFolderName': 'Назва нової папки',
  'storage.createFolder': 'Створити папку',
  'storage.search': 'Пошук файлів...',
  'storage.searchLabel': 'Пошук файлів',
  'storage.filterType': 'Фільтр типу',
  'storage.allTypes': 'Усі типи',
  'storage.images': 'Зображення',
  'storage.documents': 'Документи',
  'storage.videos': 'Відео',
  'storage.other': 'Інше',
  'storage.gridView': 'Вигляд сіткою',
  'storage.listView': 'Вигляд списком',
  'storage.loading': 'Завантаження файлів...',
  'storage.emptyTitle': 'Файлів ще немає',
  'storage.emptyDescription':
    'Завантаж фото й документи кнопкою вище або перетягни їх у панель завантаження.',
  'storage.deleteFile': 'Видалити {name}',
  'upload.drop': 'Перетягни файли сюди або натисни для вибору',
  'upload.paste': 'Вставляй зображення з буфера (Ctrl+V)',
  'crop.title': 'Обрізати зображення',
  'crop.description': 'Налаштуй область обрізки перед завантаженням.',
  'crop.zoom': 'Масштаб',
  'crop.free': 'Вільно',
  'crop.cancel': 'Скасувати',
  'crop.upload': 'Завантажити обрізане',
};

const dictionaries: Record<Language, Dictionary> = { en, ua };

export function translate(language: Language, key: string, values?: TranslationValues): string {
  const dict = dictionaries[language] ?? en;
  let result = dict[key] ?? en[key] ?? key;
  if (values) {
    for (const [name, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    }
  }
  return result;
}
