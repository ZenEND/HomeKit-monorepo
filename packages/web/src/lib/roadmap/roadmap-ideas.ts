import type { FC } from 'react';
import {
  Code01,
  Lightbulb01,
  Stars01,
  Zap,
} from '@untitledui/icons';

export interface VisionPrinciple {
  id: string;
  title: string;
  description: string;
  icon: FC<{ className?: string }>;
}

export interface GameIdea {
  id: string;
  name: string;
  tagline: string;
  players: string;
  backendSkill: string;
  targetPhase: string;
}

export interface BackendLearningItem {
  id: string;
  topic: string;
  why: string;
  usedIn: string;
}

export interface FreeLlmOption {
  id: string;
  name: string;
  cost: string;
  bestFor: string;
  notes: string;
}

export const visionPrinciples: VisionPrinciple[] = [
  {
    id: 'fun-first',
    title: 'Fun first',
    description:
      'If friends don\'t laugh on the couch, it doesn\'t ship. Every feature starts as a game night or dinner, not a tech demo.',
    icon: Stars01,
  },
  {
    id: 'learn-by-building',
    title: 'Learn by building',
    description:
      'Each phase teaches real backend skills — auth, WebSockets, queues, file I/O, LLM APIs — through features you actually use.',
    icon: Code01,
  },
  {
    id: 'zero-to-low-cost',
    title: 'Zero-to-low cost',
    description:
      'Self-hosted on your machine, free LLMs locally or on generous free tiers. No subscriptions required to play.',
    icon: Zap,
  },
  {
    id: 'private-by-default',
    title: 'Private by default',
    description:
      'Your data stays on your network. Friends get in via QR invites with page-level access — not a public SaaS.',
    icon: Lightbulb01,
  },
];

export const gameCatalog: GameIdea[] = [
  {
    id: 'crocodile',
    name: 'Crocodile',
    tagline: 'Explain the word without saying it — classic party mode',
    players: '4–12',
    backendSkill: 'REST rooms, turn state machine, timers',
    targetPhase: 'Sep 2026',
  },
  {
    id: 'alias',
    name: 'Alias',
    tagline: 'Teams race to guess words from clues before the timer runs out',
    players: '4–16',
    backendSkill: 'Team scoring, round batches, word packs API',
    targetPhase: 'Oct 2026',
  },
  {
    id: 'mafia',
    name: 'Mafia / Werewolf',
    tagline: 'Hidden roles, day/night phases, accusations and votes',
    players: '6–15',
    backendSkill: 'WebSockets, private role channels, phase orchestration',
    targetPhase: 'Nov 2026',
  },
  {
    id: 'quiz',
    name: 'Quiz Night',
    tagline: 'Custom trivia rounds — movies, memes, inside jokes',
    players: '2–20',
    backendSkill: 'LLM question generation, answer validation, leaderboards',
    targetPhase: 'Nov 2026',
  },
  {
    id: 'draw-guess',
    name: 'Draw & Guess',
    tagline: 'Sketch on phone, others guess — chaotic and hilarious',
    players: '3–10',
    backendSkill: 'Real-time canvas sync via WebSocket, stroke events',
    targetPhase: 'Nov 2026',
  },
  {
    id: 'codenames-lite',
    name: 'Codenames-lite',
    tagline: 'One-word clues linking grid cards — spy theme optional',
    players: '4–8',
    backendSkill: 'Grid generation, clue validation, team turn logic',
    targetPhase: 'Dec 2026',
  },
  {
    id: 'would-you-rather',
    name: 'Would You Rather',
    tagline: 'Absurd dilemmas — vote and see what the group picks',
    players: '2–12',
    backendSkill: 'LLM prompt templates, vote aggregation, results UI',
    targetPhase: 'Dec 2026',
  },
  {
    id: 'charades',
    name: 'Charades+',
    tagline: 'Act it out with phone tilt to pass — no pen and paper',
    players: '4–10',
    backendSkill: 'Accelerometer hints, word decks, score sync',
    targetPhase: 'Jan 2027',
  },
  {
    id: 'two-truths',
    name: 'Two Truths & a Lie',
    tagline: 'Personal rounds about the group — great for new friends',
    players: '3–12',
    backendSkill: 'Submission flow, anonymous voting, reveal sequence',
    targetPhase: 'Jan 2027',
  },
  {
    id: 'hot-takes',
    name: 'Hot Takes',
    tagline: 'Controversial opinions — agree or disagree, spark debates',
    players: '3–15',
    backendSkill: 'LLM topic generation with safety filters, reaction counts',
    targetPhase: 'Feb 2027',
  },
  {
    id: 'movie-bingo',
    name: 'Movie Bingo',
    tagline: 'Mark tropes during a film — Wilhelm scream, plot twist, dramatic rain',
    players: '2–12',
    backendSkill: 'Generated bingo boards, per-user progress, live reveal state',
    targetPhase: 'Feb 2027',
  },
  {
    id: 'trailer-guess',
    name: 'Trailer Guess',
    tagline: 'Watch a trailer with title hidden and guess the movie or series',
    players: '2–10',
    backendSkill: 'Media metadata API, spoiler-safe clues, timed answer lock',
    targetPhase: 'Feb 2027',
  },
  {
    id: 'episode-recap',
    name: 'Episode Recap Quiz',
    tagline: 'After an episode, answer who noticed the tiny details',
    players: '2–12',
    backendSkill: 'Question packs, per-episode sessions, scoreboard persistence',
    targetPhase: 'Mar 2027',
  },
  {
    id: 'plot-predictions',
    name: 'Plot Predictions',
    tagline: 'Pause before the finale and predict deaths, twists, ships, betrayals',
    players: '2–12',
    backendSkill: 'Private submissions, reveal timeline, scoring rules engine',
    targetPhase: 'Mar 2027',
  },
  {
    id: 'soundtrack-challenge',
    name: 'Soundtrack Challenge',
    tagline: 'Guess the film or series from a theme song or soundtrack clue',
    players: '3–12',
    backendSkill: 'Round playlists, audio hints, answer matching',
    targetPhase: 'Mar 2027',
  },
  {
    id: 'watch-party-sync',
    name: 'Watch Party Sync',
    tagline: 'Everyone presses play together, reacts, and votes on what to watch next',
    players: '2–20',
    backendSkill: 'Presence, synchronized timers, reaction events, polls',
    targetPhase: 'Apr 2027',
  },
];

export const backendLearningTrack: BackendLearningItem[] = [
  {
    id: 'nestjs-modules',
    topic: 'NestJS modules & DTOs',
    why: 'Structure grows fast with games + storage + auth',
    usedIn: 'Every API phase',
  },
  {
    id: 'jwt-rbac',
    topic: 'JWT + role-based access',
    why: 'Owner / partner / friend with page-level permissions',
    usedIn: 'Access & Roles, QR invites',
  },
  {
    id: 'websockets',
    topic: 'WebSockets (Socket.io or ws)',
    why: 'Live game state, drawing sync, Mafia night phase',
    usedIn: 'Mafia, Draw & Guess, real-time lobby',
  },
  {
    id: 'redis',
    topic: 'Redis pub/sub & caching',
    why: 'Room state, rate limits, session store',
    usedIn: 'Game rooms, LLM response cache',
  },
  {
    id: 'postgres',
    topic: 'Postgres + TypeORM relations',
    why: 'Users, invites, scores, file metadata',
    usedIn: 'Auth, storage, leaderboards',
  },
  {
    id: 'file-io',
    topic: 'Multer + disk volumes + thumbnails',
    why: 'Real photo storage on local server',
    usedIn: 'File storage phase',
  },
  {
    id: 'llm-api',
    topic: 'LLM API integration + fallbacks',
    why: 'Word/quiz generation with offline JSON backup',
    usedIn: 'Alias, Quiz, Hot Takes',
  },
  {
    id: 'pwa-sync',
    topic: 'Service workers & background sync',
    why: 'Games work when Wi-Fi flickers at home',
    usedIn: 'Offline-first PWA',
  },
];

export const freeLlmOptions: FreeLlmOption[] = [
  {
    id: 'ollama',
    name: 'Ollama (local)',
    cost: 'Free — runs on your Mac/server',
    bestFor: 'Word packs, quiz questions, hot takes — no data leaves home',
    notes: 'Use Llama 3.2, Mistral, or Phi-3. Best default for HomeKit. Zero API bills.',
  },
  {
    id: 'groq',
    name: 'Groq Cloud free tier',
    cost: 'Free tier with rate limits',
    bestFor: 'Fast inference when local GPU is weak',
    notes: 'Llama/Mixtral models. Good for burst game rounds. Add fallback to Ollama.',
  },
  {
    id: 'gemini',
    name: 'Google Gemini API',
    cost: 'Generous free tier (check current limits)',
    bestFor: 'Creative word lists and trivia when online',
    notes: 'Gemini Flash is cheap/fast. Cache responses in Redis to minimize calls.',
  },
  {
    id: 'openrouter-free',
    name: 'OpenRouter free models',
    cost: 'Free model routes available',
    bestFor: 'Experimenting with different models without commitment',
    notes: 'Pick `:free` tagged models. Wrap in abstraction so switching is one env var.',
  },
  {
    id: 'json-banks',
    name: 'Curated JSON word banks',
    cost: 'Always free — no LLM needed',
    bestFor: 'Offline game nights, zero latency, 100% reliability',
    notes: 'Ship first with static packs (movies, animals, home). LLM is optional spice.',
  },
];

export const llmStrategyNote =
  'Recommended stack: start with JSON word banks + Ollama locally. Add Groq or Gemini as online boost. Never block a game night on a paid API.';
