export interface PartyIdea {
  id: string;
  title: string;
  emoji: string;
  vibe: string;
  groupSize: string;
  summary: string;
  howItWorks: string[];
  homekitTieIn: string;
}

export const partyIdeas: PartyIdea[] = [
  {
    id: 'f1-watch-party',
    title: 'F1 Race-Day Watch Party',
    emoji: '🏎️',
    vibe: 'Adrenaline + snacks',
    groupSize: '3–10',
    summary:
      'Gather for a Grand Prix with a live standings screen, a prediction pool, and themed snacks per team.',
    howItWorks: [
      'Open the F1 page on the TV for the grid and live positions',
      'Everyone picks a podium prediction before lights out',
      'Award silly prizes for closest guess and worst guess',
      'Pit-stop snack breaks during safety cars',
    ],
    homekitTieIn: 'Uses the Formula 1 Fun page; add a prediction mini-game later.',
  },
  {
    id: 'game-night',
    title: 'Couch Game Night',
    emoji: '🎮',
    vibe: 'Laughs + friendly chaos',
    groupSize: '4–12',
    summary:
      'Phones as controllers, the HomeKit screen as host. Rotate through Crocodile, Alias, and Mafia.',
    howItWorks: [
      'Scan a QR invite to join the room from any phone',
      'Pick a game and teams from the lobby',
      'Play 2–3 short games, keep a running scoreboard',
      'Crown a champion at the end of the night',
    ],
    homekitTieIn: 'Uses the Games + Invite pages; scoreboard ties into game rooms.',
  },
  {
    id: 'themed-dinner',
    title: 'Themed Dinner Night',
    emoji: '🍝',
    vibe: 'Cozy + tasty',
    groupSize: '2–8',
    summary:
      'Pick a cuisine, everyone orders or cooks a dish, and the shared menu tracks who brings what.',
    howItWorks: [
      'Vote on a theme: Italian, sushi, taco night, etc.',
      'Build the shared menu and claim dishes on the Food page',
      'Set a time and location with the Plans page',
      'Rate each dish afterwards for the hall of fame',
    ],
    homekitTieIn: 'Uses the Food + Plans pages; ratings feed menu favorites.',
  },
  {
    id: 'movie-marathon',
    title: 'Movie / Series Marathon',
    emoji: '🍿',
    vibe: 'Chill + nostalgic',
    groupSize: '2–8',
    summary:
      'A themed binge night — trilogy, director, or genre — with a shared snack run and voting on what is next.',
    howItWorks: [
      'Propose a lineup and vote on the order',
      'Assign snacks and drinks via the shared menu',
      'Quick trivia round between films using Quiz Night',
      'Save the lineup to the storage page for next time',
    ],
    homekitTieIn: 'Pairs Storage (saved lists) + Games (trivia) + Food.',
  },
  {
    id: 'quiz-night',
    title: 'Pub-Style Quiz Night',
    emoji: '🧠',
    vibe: 'Competitive + clever',
    groupSize: '4–16',
    summary:
      'Teams battle across custom rounds — inside jokes, movies, memes — with an LLM generating fresh questions.',
    howItWorks: [
      'Split into teams and name them',
      'Run 4–5 themed rounds from the Quiz Night game',
      'Use a free local LLM to generate questions on demand',
      'Tally scores live and reveal answers dramatically',
    ],
    homekitTieIn: 'Uses Games (Quiz Night) + free Ollama word/question generation.',
  },
  {
    id: 'outdoor-day',
    title: 'Outdoor Day / Picnic',
    emoji: '🧺',
    vibe: 'Fresh air + relaxed',
    groupSize: '4–20',
    summary:
      'A park meetup with a pinned location, a shared packing list, and lawn-friendly games.',
    howItWorks: [
      'Drop a location pin and time on the Plans page',
      'Build a packing/food list everyone contributes to',
      'Play Charades+ and Two Truths in the grass',
      'Share photos straight to the storage album after',
    ],
    homekitTieIn: 'Uses Plans (location) + Games + Storage (photo album).',
  },
  {
    id: 'birthday-surprise',
    title: 'Birthday Surprise',
    emoji: '🎂',
    vibe: 'Sentimental + festive',
    groupSize: '5–25',
    summary:
      'Coordinate a surprise with private invites, a secret plan timeline, and a shared photo/video wall.',
    howItWorks: [
      'Send role-based invites that hide details from the guest of honor',
      'Plan arrival times and tasks on a private timeline',
      'Collect messages and clips into a storage album',
      'Reveal the album on the big screen at the party',
    ],
    homekitTieIn: 'Uses Invite (role-based) + Plans + Storage (memory wall).',
  },
  {
    id: 'how-well-you-know',
    title: 'How Well Do You Know Each Other',
    emoji: '💞',
    vibe: 'Bonding + funny reveals',
    groupSize: '2–10',
    summary:
      'A relationship/friendship quiz where everyone guesses answers about each other — great for new and old friends.',
    howItWorks: [
      'Each person secretly answers a set of fun prompts',
      'The group guesses each answer for points',
      'Reveal answers one by one for laughs and gasps',
      'Save the funniest answers to a private album',
    ],
    homekitTieIn: 'Builds on the Games engine (submission + voting flow).',
  },
];


const partyIdeasUa: Record<
  string,
  Pick<PartyIdea, 'title' | 'vibe' | 'summary' | 'howItWorks' | 'homekitTieIn'>
> = {
  'f1-watch-party': {
    title: 'Перегляд Формули 1',
    vibe: 'Адреналін + снеки',
    summary:
      'Зберіться на Гран-прі з екраном живого заліку, пулом прогнозів і тематичними снеками під команди.',
    howItWorks: [
      'Відкрий сторінку F1 на телевізорі для решітки та позицій',
      'Кожен обирає прогноз подіуму до старту',
      'Видайте смішні призи за найточніший і найгірший прогноз',
      'Піт-стопи зі снеками під час safety car',
    ],
    homekitTieIn: 'Використовує сторінку Формули 1; пізніше можна додати міні-гру прогнозів.',
  },
  'game-night': {
    title: 'Ігровий вечір на дивані',
    vibe: 'Сміх + дружній хаос',
    summary:
      'Телефони як контролери, екран HomeKit як хост. Ротація через Крокодила, Аліас і Мафію.',
    howItWorks: [
      'Скануйте QR-запрошення, щоб приєднатися з телефона',
      'Оберіть гру й команди в лобі',
      'Зіграйте 2–3 короткі гри з наскрізним рахунком',
      'Наприкінці вечора коронуйте чемпіона',
    ],
    homekitTieIn: 'Використовує сторінки Ігри + Запрошення; scoreboard повʼязаний з кімнатами ігор.',
  },
  'themed-dinner': {
    title: 'Тематична вечеря',
    vibe: 'Затишно + смачно',
    summary:
      'Оберіть кухню, кожен замовляє або готує страву, а спільне меню показує, хто що приносить.',
    howItWorks: [
      'Проголосуйте за тему: італійська, суші, тако тощо',
      'Створіть спільне меню й закріпіть страви на сторінці Їжа',
      'Поставте час і місце на сторінці Планів',
      'Після вечері оцініть страви для залу слави',
    ],
    homekitTieIn: 'Використовує Їжу + Плани; оцінки потрапляють в улюблені меню.',
  },
  'movie-marathon': {
    title: 'Кіномарафон / серіальний вечір',
    vibe: 'Спокійно + ностальгійно',
    summary:
      'Тематичний перегляд — трилогія, режисер або жанр — зі спільним списком снеків і голосуванням за наступний фільм.',
    howItWorks: [
      'Запропонуйте список і проголосуйте за порядок',
      'Розподіліть снеки й напої через спільне меню',
      'Між фільмами запускайте коротку вікторину',
      'Збережіть список у сховище на наступний раз',
    ],
    homekitTieIn: 'Поєднує Сховище (збережені списки), Ігри (вікторина) та Їжу.',
  },
  'quiz-night': {
    title: 'Вікторина як у пабі',
    vibe: 'Змагально + розумно',
    summary:
      'Команди змагаються в кастомних раундах — внутрішні жарти, фільми, меми — а LLM генерує свіжі питання.',
    howItWorks: [
      'Поділіться на команди й придумайте назви',
      'Запустіть 4–5 тематичних раундів у грі Вікторина',
      'Використайте безкоштовну локальну LLM для генерації питань',
      'Рахуйте бали наживо й драматично відкривайте відповіді',
    ],
    homekitTieIn: 'Використовує Ігри (Вікторина) + безкоштовну Ollama для генерації питань.',
  },
  'outdoor-day': {
    title: 'Пікнік / день на вулиці',
    vibe: 'Свіже повітря + релакс',
    summary:
      'Зустріч у парку з pinned-локацією, спільним списком речей і іграми для трави.',
    howItWorks: [
      'Додайте локацію й час на сторінці Планів',
      'Створіть список їжі/речей, який усі доповнюють',
      'Грайте в Шаради+ та Дві правди й брехню на траві',
      'Після цього завантажте фото прямо в альбом сховища',
    ],
    homekitTieIn: 'Використовує Плани (локація) + Ігри + Сховище (фотоальбом).',
  },
  'birthday-surprise': {
    title: 'Сюрприз на день народження',
    vibe: 'Зворушливо + святково',
    summary:
      'Координація сюрпризу з приватними запрошеннями, секретним таймлайном і спільною фото/відео-стіною.',
    howItWorks: [
      'Надішліть role-based запрошення, що ховають деталі від іменинника',
      'Заплануйте час прибуття й задачі в приватному таймлайні',
      'Зберіть повідомлення й кліпи в альбом сховища',
      'Покажіть альбом на великому екрані під час вечірки',
    ],
    homekitTieIn: 'Використовує Запрошення (ролі) + Плани + Сховище (стіна спогадів).',
  },
  'how-well-you-know': {
    title: 'Наскільки добре ви знаєте одне одного',
    vibe: 'Зближення + смішні відкриття',
    summary:
      'Квіз про стосунки/дружбу, де всі вгадують відповіді одне одного — добре для нових і старих друзів.',
    howItWorks: [
      'Кожен потай відповідає на веселі питання',
      'Група вгадує відповіді за бали',
      'Відкривайте відповіді по черзі для сміху й здивування',
      'Збережіть найсмішніші відповіді в приватний альбом',
    ],
    homekitTieIn: 'Будується на ігровому движку (відповіді + голосування).',
  },
};

export function localizePartyIdea(idea: PartyIdea, language: 'en' | 'ua'): PartyIdea {
  return language === 'ua' && partyIdeasUa[idea.id] ? { ...idea, ...partyIdeasUa[idea.id] } : idea;
}
