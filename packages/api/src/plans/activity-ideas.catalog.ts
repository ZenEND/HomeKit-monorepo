import { PlanActivityType } from './plans.enums';
import type { IdeaCardDto } from './dto/responses/recommendations-response.dto';

export interface ActivityIdea {
  id: string;
  title: string;
  emoji: string;
  vibe: string;
  groupSize: string;
  summary: string;
  howItWorks: string[];
  homekitTieIn: string;
}

function toIdeaCard(idea: ActivityIdea): IdeaCardDto {
  return {
    id: idea.id,
    title: idea.title,
    emoji: idea.emoji,
    vibe: idea.vibe,
    groupSize: idea.groupSize,
    summary: idea.summary,
    howItWorks: idea.howItWorks,
    homekitTieIn: idea.homekitTieIn,
    posterUrl: null,
    rank: null,
    rating: null,
    tag: null,
  };
}

export const RACING_IDEAS: ActivityIdea[] = [
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
    id: 'motogp-brunch',
    title: 'MotoGP Sunday Brunch',
    emoji: '🏍️',
    vibe: 'Relaxed + fast bikes',
    groupSize: '2–6',
    summary: 'Sunday morning MotoGP with brunch and a simple fastest-lap prediction sheet.',
    howItWorks: [
      'Stream the race on the big screen',
      'Everyone picks fastest lap rider before the race',
      'Brunch potluck with themed dishes',
      'Score predictions on a shared sheet',
    ],
    homekitTieIn: 'Extend the Racing section with MotoGP calendar later.',
  },
  {
    id: 'wrc-rally-night',
    title: 'WRC Rally Highlights Night',
    emoji: '🌲',
    vibe: 'Dusty + dramatic',
    groupSize: '2–8',
    summary: 'Watch rally stage highlights with a map on screen and guess stage winners.',
    howItWorks: [
      'Queue up the best stages from the latest rally',
      'Show the stage map on a second screen',
      'Guess the stage winner before each highlight',
      'Crown the rally trivia champion',
    ],
    homekitTieIn: 'Pairs with Racing plans and future WRC calendar sync.',
  },
  {
    id: 'endurance-watch',
    title: '24h Endurance Watch',
    emoji: '⏱️',
    vibe: 'Marathon + cozy',
    groupSize: '4–12',
    summary: 'Le Mans or Daytona — rotate shifts, keep a snack station, and track pit stops.',
    howItWorks: [
      'Split into watch shifts with a shared schedule',
      'Set up a snack and coffee station',
      'Track safety cars and weather changes',
      'Morning recap with best moments reel',
    ],
    homekitTieIn: 'Save the event to Plans and share shift assignments.',
  },
];

export const COOKING_IDEAS: ActivityIdea[] = [
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
      'Build the shared menu and claim dishes',
      'Set a time and location on Plans',
      'Rate each dish afterwards for the hall of fame',
    ],
    homekitTieIn: 'Uses Food + Plans pages; ratings feed menu favorites.',
  },
  {
    id: 'cook-off',
    title: 'Friendly Cook-Off',
    emoji: '👨‍🍳',
    vibe: 'Competitive + fun',
    groupSize: '4–10',
    summary: 'Same secret ingredient, timed rounds, blind tasting and scorecards.',
    howItWorks: [
      'Draw a secret ingredient everyone must use',
      'Set a 45-minute timer',
      'Blind taste and score on presentation, taste, creativity',
      'Reveal the winner on the big screen',
    ],
    homekitTieIn: 'Scorecards can tie into Games engine later.',
  },
  {
    id: 'brunch-club',
    title: 'Sunday Brunch Club',
    emoji: '🥞',
    vibe: 'Lazy + delicious',
    groupSize: '3–8',
    summary: 'Rotating host, everyone brings one dish, shared playlist and coffee.',
    howItWorks: [
      'Rotate hosts monthly',
      'Each guest brings one dish or drink',
      'Create a shared playlist for the morning',
      'Save favorite recipes to Storage',
    ],
    homekitTieIn: 'Save recipes and brunch dates in Plans.',
  },
  {
    id: 'baking-night',
    title: 'Baking Night',
    emoji: '🧁',
    vibe: 'Sweet + creative',
    groupSize: '2–6',
    summary: 'Pick one bake (cookies, cinnamon rolls, pizza dough) and do it together.',
    howItWorks: [
      'Vote on what to bake',
      'Split prep tasks on a checklist',
      'Document the process with photos',
      'Share the results (and failures) afterwards',
    ],
    homekitTieIn: 'Checklist and photos tie into Storage.',
  },
];

export const PARTY_IDEAS: ActivityIdea[] = [
  {
    id: 'game-night',
    title: 'Couch Game Night',
    emoji: '🎮',
    vibe: 'Laughs + friendly chaos',
    groupSize: '4–12',
    summary:
      'Phones as controllers, the HomeKit screen as host. Rotate through party games.',
    howItWorks: [
      'Scan a QR invite to join the room from any phone',
      'Pick a game and teams from the lobby',
      'Play 2–3 short games, keep a running scoreboard',
      'Crown a champion at the end of the night',
    ],
    homekitTieIn: 'Uses the Games + Invite pages; scoreboard ties into game rooms.',
  },
  {
    id: 'movie-marathon',
    title: 'Movie / Series Marathon',
    emoji: '🍿',
    vibe: 'Chill + nostalgic',
    groupSize: '2–8',
    summary:
      'A themed binge night — trilogy, director, or genre — with a shared snack run.',
    howItWorks: [
      'Propose a lineup and vote on the order',
      'Assign snacks and drinks via the shared menu',
      'Quick trivia round between films',
      'Save the lineup to Storage for next time',
    ],
    homekitTieIn: 'Pairs Storage + Games + Food.',
  },
  {
    id: 'quiz-night',
    title: 'Pub-Style Quiz Night',
    emoji: '🧠',
    vibe: 'Competitive + clever',
    groupSize: '4–16',
    summary:
      'Teams battle across custom rounds — inside jokes, movies, memes — with fresh questions.',
    howItWorks: [
      'Split into teams and name them',
      'Run 4–5 themed rounds from Quiz Night',
      'Use a free local LLM to generate questions on demand',
      'Tally scores live and reveal answers dramatically',
    ],
    homekitTieIn: 'Uses Games (Quiz Night) + free LLM generation.',
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
      'Drop a location pin and time on Plans',
      'Build a packing/food list everyone contributes to',
      'Play Charades and Two Truths in the grass',
      'Share photos straight to the storage album after',
    ],
    homekitTieIn: 'Uses Plans (location) + Games + Storage.',
  },
  {
    id: 'birthday-surprise',
    title: 'Birthday Surprise',
    emoji: '🎂',
    vibe: 'Sentimental + festive',
    groupSize: '5–25',
    summary:
      'Coordinate a surprise with private invites, a secret plan timeline, and a shared photo wall.',
    howItWorks: [
      'Send role-based invites that hide details from the guest of honor',
      'Plan arrival times and tasks on a private timeline',
      'Collect messages and clips into a storage album',
      'Reveal the album on the big screen at the party',
    ],
    homekitTieIn: 'Uses Invite (role-based) + Plans + Storage.',
  },
  {
    id: 'how-well-you-know',
    title: 'How Well Do You Know Each Other',
    emoji: '💞',
    vibe: 'Bonding + funny reveals',
    groupSize: '2–10',
    summary:
      'A friendship quiz where everyone guesses answers about each other.',
    howItWorks: [
      'Each person secretly answers a set of fun prompts',
      'The group guesses each answer for points',
      'Reveal answers one by one for laughs and gasps',
      'Save the funniest answers to a private album',
    ],
    homekitTieIn: 'Builds on the Games engine (submission + voting flow).',
  },
];

export const BOARDGAME_IDEAS: ActivityIdea[] = [
  {
    id: 'catan-night',
    title: 'Settlers of Catan Night',
    emoji: '🏝️',
    vibe: 'Strategic + trade-heavy',
    groupSize: '3–4',
    summary: 'Classic resource trading with expansions if the group is experienced.',
    howItWorks: [
      'Set up the base board with random tile layout',
      'Explain robber and trading rules for newcomers',
      'Play to 10 victory points',
      'Optional: best-of-three for regulars',
    ],
    homekitTieIn: 'Track wins on a Plans scoreboard later.',
  },
  {
    id: 'codenames-party',
    title: 'Codenames Session',
    emoji: '🕵️',
    vibe: 'Wordplay + teams',
    groupSize: '4–8',
    summary: 'Two teams, one spymaster each, race to find all their words.',
    howItWorks: [
      'Split into two teams',
      'Spymasters give one-word clues',
      'First team to find all agents wins',
      'Rotate spymasters each round',
    ],
    homekitTieIn: 'Codenames-lite is on the Games roadmap.',
  },
  {
    id: 'ticket-to-ride',
    title: 'Ticket to Ride Evening',
    emoji: '🚂',
    vibe: 'Relaxed + route-building',
    groupSize: '2–5',
    summary: 'Build train routes across the map — great gateway game for mixed groups.',
    howItWorks: [
      'Deal destination tickets and train cards',
      'Take turns drawing cards or claiming routes',
      'Reveal tickets at the end for bonus points',
      'Highest score wins',
    ],
    homekitTieIn: 'Save favorite maps to Plans for repeat nights.',
  },
  {
    id: 'pandemic-coop',
    title: 'Pandemic Co-op',
    emoji: '🦠',
    vibe: 'Cooperative + tense',
    groupSize: '2–4',
    summary: 'Work together to cure diseases before outbreaks overwhelm the world.',
    howItWorks: [
      'Each player picks a role with a unique ability',
      'Discuss strategy openly — it is cooperative',
      'Draw infection cards and manage outbreaks',
      'Win by curing all four diseases',
    ],
    homekitTieIn: 'Great for quieter groups; track wins in Plans.',
  },
  {
    id: 'azul-beautiful',
    title: 'Azul Pattern Night',
    emoji: '🟦',
    vibe: 'Beautiful + tactical',
    groupSize: '2–4',
    summary: 'Draft tiles to build the most aesthetic wall — quick to teach, deep to master.',
    howItWorks: [
      'Take turns drafting tiles from factories',
      'Place tiles on your pattern lines',
      'Score for completed rows, columns, and colors',
      'Highest score after 5 rounds wins',
    ],
    homekitTieIn: 'Pairs well with a cozy cooking evening beforehand.',
  },
];

export const PARTYGAME_IDEAS: ActivityIdea[] = [
  {
    id: 'alias-home',
    title: 'Alias at Home',
    emoji: '🗣️',
    vibe: 'Fast + loud',
    groupSize: '4–12',
    summary: 'The HomeKit Alias game — phones as buzzers, TV as scoreboard.',
    howItWorks: [
      'Open /alias on the TV or laptop',
      'Split into teams and set round timer',
      'Explain words without saying them',
      'Track scores across rounds',
    ],
    homekitTieIn: 'Playable now via the Alias game page.',
  },
  {
    id: 'jackbox-style',
    title: 'Jackbox-Style Trivia',
    emoji: '📱',
    vibe: 'Phone-driven + hilarious',
    groupSize: '3–8',
    summary: 'Everyone uses their phone to answer prompts — TV shows the questions.',
    howItWorks: [
      'Host starts a room on the big screen',
      'Players join from their phones',
      'Answer prompts, draw, or vote each round',
      'Lowest score buys snacks next time',
    ],
    homekitTieIn: 'Future party game engine with phone controllers.',
  },
  {
    id: 'draw-guess',
    title: 'Draw & Guess',
    emoji: '🎨',
    vibe: 'Creative + chaotic',
    groupSize: '4–10',
    summary: 'One person draws, everyone else guesses — points for speed and accuracy.',
    howItWorks: [
      'Rotate the drawer each round',
      'Set a 60-second timer',
      'First correct guess gets the most points',
      'Play 8–10 rounds and crown a winner',
    ],
    homekitTieIn: 'On the Games roadmap as Draw & Guess.',
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather',
    emoji: '🤔',
    vibe: 'Debates + surprises',
    groupSize: '3–12',
    summary: 'Impossible choices, group votes, and argument bonuses.',
    howItWorks: [
      'Read a would-you-rather prompt',
      'Everyone picks A or B secretly',
      'Reveal and debate the choices',
      'Award points for the funniest justification',
    ],
    homekitTieIn: 'On the Games roadmap; great filler between rounds.',
  },
  {
    id: 'hot-takes',
    title: 'Hot Takes',
    emoji: '🔥',
    vibe: 'Spicy + opinionated',
    groupSize: '3–10',
    summary: 'Controversial opinions, group rates them from cold to nuclear.',
    howItWorks: [
      'Each player submits a hot take',
      'Read them one by one',
      'Group rates: mild, warm, hot, nuclear',
      'Most nuclear take wins',
    ],
    homekitTieIn: 'On the Games roadmap as Hot Takes.',
  },
  {
    id: 'charades-plus',
    title: 'Charades+',
    emoji: '🎭',
    vibe: 'Physical + silly',
    groupSize: '4–16',
    summary: 'Classic charades with category rounds and a timer on the big screen.',
    howItWorks: [
      'Pick categories: movies, games, memes',
      'One actor, team guesses within 90 seconds',
      'Pass costs a point',
      'Team with most correct guesses wins',
    ],
    homekitTieIn: 'On the Games roadmap as Charades+.',
  },
];

export const ACTIVITY_IDEAS: Record<PlanActivityType, ActivityIdea[]> = {
  [PlanActivityType.Watching]: [],
  [PlanActivityType.Racing]: RACING_IDEAS,
  [PlanActivityType.Cooking]: COOKING_IDEAS,
  [PlanActivityType.Party]: PARTY_IDEAS,
  [PlanActivityType.BoardGame]: BOARDGAME_IDEAS,
  [PlanActivityType.PartyGame]: PARTYGAME_IDEAS,
};

export function mapIdeasToCards(ideas: ActivityIdea[]): IdeaCardDto[] {
  return ideas.map(toIdeaCard);
}
