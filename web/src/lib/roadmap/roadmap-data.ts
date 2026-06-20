import type { FC } from 'react';
import {
  CpuChip01,
  Globe01,
  MessageChatCircle,
  PuzzlePiece01,
  QrCode01,
  Rocket01,
  Server01,
  Shield01,
  ShoppingCart01,
  Speedometer02,
  Stars01,
  Wifi,
} from '@untitledui/icons';

export type StepStatus = 'completed' | 'in-progress' | 'planned';

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: StepStatus;
  icon: FC<{ className?: string }>;
  steps: RoadmapStep[];
}

export const roadmap: RoadmapPhase[] = [
  {
    id: 'phase-0',
    title: 'Foundation',
    description:
      'Monorepo, API, web app, Docker stack, UI kit, login form, mock file storage, and components showcase.',
    targetDate: 'Jun 2026',
    status: 'completed',
    icon: Rocket01,
    steps: [
      {
        id: 'p0-s1',
        title: 'Monorepo with NestJS API + Swagger',
        description:
          'pnpm workspace holding api and web. NestJS exposes a health endpoint and auto-generated Swagger docs at /docs.',
        status: 'completed',
      },
      {
        id: 'p0-s2',
        title: 'Vite/React web with Untitled UI',
        description:
          'React 19 + Vite front end wired to Tailwind v4 and the Untitled UI kit with React Aria components.',
        status: 'completed',
      },
      {
        id: 'p0-s3',
        title: 'Docker Compose dev stack',
        description:
          'Postgres, api, and web run together with hot reload so the whole stack starts with one command.',
        status: 'completed',
      },
      {
        id: 'p0-s4',
        title: 'Login form with yup validation',
        description:
          'react-hook-form + yup schema with accessible inputs, inline errors, and a mock submit flow.',
        status: 'completed',
      },
      {
        id: 'p0-s5',
        title: 'Mock file storage UI',
        description:
          'Frontend-first storage page with folders, filters, grid/list views, upload, and image cropping on a mock API.',
        status: 'completed',
      },
      {
        id: 'p0-s6',
        title: 'Components showcase page',
        description:
          'A living gallery of base components, loaders, animations, and file icons to reuse across features.',
        status: 'completed',
      },
    ],
  },
  {
    id: 'phase-1',
    title: 'Access & Roles',
    description:
      'Real authentication, user roles (owner, partner, friend), protected routes, and per-page access control.',
    targetDate: 'Jul 2026',
    status: 'planned',
    icon: Shield01,
    steps: [
      {
        id: 'p1-s1',
        title: 'JWT auth with NestJS',
        description:
          'Sign-up/login issuing JWT access + refresh tokens, password hashing, and a NestJS auth guard.',
        status: 'planned',
      },
      {
        id: 'p1-s2',
        title: 'User roles: owner / partner / friend',
        description:
          'Role enum stored per user and a roles guard so each endpoint declares who is allowed in.',
        status: 'planned',
      },
      {
        id: 'p1-s3',
        title: 'Protected routes on web',
        description:
          'Route guards that redirect unauthenticated users to login and restore the intended page after sign-in.',
        status: 'planned',
      },
      {
        id: 'p1-s4',
        title: 'Per-page access permissions',
        description:
          'Fine-grained grants so a friend can see Games but not Storage — checked on both API and UI.',
        status: 'planned',
      },
      {
        id: 'p1-s5',
        title: 'User profile and theme settings',
        description:
          'Editable profile, avatar, language, and light/dark theme persisted per user.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'QR Invite System',
    description:
      'Time-limited invite tokens, QR code generation, scan-to-join flow, and invite management for friends.',
    targetDate: 'Aug 2026',
    status: 'planned',
    icon: QrCode01,
    steps: [
      {
        id: 'p2-s1',
        title: 'Generate time-limited invite tokens',
        description:
          'Signed, expiring tokens with optional usage limits so an invite can be single-use or last a weekend.',
        status: 'planned',
      },
      {
        id: 'p2-s2',
        title: 'QR code render and scan-to-join',
        description:
          'Render a QR for any invite and a mobile-friendly landing page that joins the group on scan.',
        status: 'planned',
      },
      {
        id: 'p2-s3',
        title: 'Per-page access grants on invite',
        description:
          'Pick exactly which pages an invite unlocks before sharing it, mapped to the roles system.',
        status: 'planned',
      },
      {
        id: 'p2-s4',
        title: 'Invite management dashboard',
        description:
          'See active invites, who joined, and revoke access in one click.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Games: Crocodile',
    description:
      'First playable party game — room creation, turn timer, scoring, mobile-first UI. Ship fun before polish.',
    targetDate: 'Sep 2026',
    status: 'planned',
    icon: PuzzlePiece01,
    steps: [
      {
        id: 'p3-s1',
        title: 'Game room creation and join (REST + lobby code)',
        description:
          'Create a room, share a short lobby code, and let friends join from their phones over REST.',
        status: 'planned',
      },
      {
        id: 'p3-s2',
        title: 'Turn timer and word reveal flow',
        description:
          'Per-turn countdown, secret word shown only to the active player, and skip/correct controls.',
        status: 'planned',
      },
      {
        id: 'p3-s3',
        title: 'Scoring and round state machine',
        description:
          'A clear state machine for rounds and turns that tracks points and prevents invalid transitions.',
        status: 'planned',
      },
      {
        id: 'p3-s4',
        title: 'Mobile-first game UI with sound effects',
        description:
          'Big touch targets, haptics, and sound cues tuned for passing one phone around the couch.',
        status: 'planned',
      },
      {
        id: 'p3-s5',
        title: 'Static JSON word pack (no LLM required)',
        description:
          'Ship a curated word bank so the first game works instantly with zero AI dependency.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-4',
    title: 'Games: Alias + Free LLM Words',
    description:
      'Alias team game plus word generation via Ollama (local) with JSON fallback — zero API spend.',
    targetDate: 'Oct 2026',
    status: 'planned',
    icon: MessageChatCircle,
    steps: [
      {
        id: 'p4-s1',
        title: 'Alias team play and round timer',
        description:
          'Teams take turns guessing from clues with a shared timer and live team scores.',
        status: 'planned',
      },
      {
        id: 'p4-s2',
        title: 'Topic filters: movies, memes, animals, custom',
        description:
          'Pick categories before the round, including a custom topic the group types in.',
        status: 'planned',
      },
      {
        id: 'p4-s3',
        title: 'Ollama integration for word packs (NestJS provider)',
        description:
          'A NestJS provider calls a local Ollama model to generate themed words — fully free and private.',
        status: 'planned',
      },
      {
        id: 'p4-s4',
        title: 'Groq/Gemini free-tier fallback + Redis cache',
        description:
          'When online, fall back to free cloud tiers and cache results in Redis to avoid repeat calls.',
        status: 'planned',
      },
      {
        id: 'p4-s5',
        title: 'Difficulty and language controls',
        description:
          'Easy/medium/hard plus English or Ukrainian word generation driven by the prompt.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-4b',
    title: 'More Party Games',
    description:
      'Mafia, Quiz Night, Draw & Guess, Codenames-lite — each teaches a new backend pattern.',
    targetDate: 'Nov 2026',
    status: 'planned',
    icon: Stars01,
    steps: [
      {
        id: 'p4b-s1',
        title: 'Mafia: WebSockets, hidden roles, day/night phases',
        description:
          'Real-time roles dealt privately, synchronized day/night phases, and accusation voting.',
        status: 'planned',
      },
      {
        id: 'p4b-s2',
        title: 'Quiz Night: LLM trivia + leaderboards',
        description:
          'Generate trivia rounds on demand, validate answers, and rank teams on a live leaderboard.',
        status: 'planned',
      },
      {
        id: 'p4b-s3',
        title: 'Draw & Guess: real-time canvas stroke sync',
        description:
          'Stream drawing strokes over WebSocket so everyone watches the sketch appear live.',
        status: 'planned',
      },
      {
        id: 'p4b-s4',
        title: 'Codenames-lite: grid generation + clue validation',
        description:
          'Generate the word grid, assign teams, and validate one-word clues against the rules.',
        status: 'planned',
      },
      {
        id: 'p4b-s5',
        title: 'Would You Rather: vote aggregation + LLM dilemmas',
        description:
          'LLM-generated dilemmas with live vote tallies and a reveal of what the group chose.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-4c',
    title: 'Formula 1 Fun + Live Data',
    description:
      'F1 hub — calendar, grid, standings, and live positions — backed by a free API with a scraper fallback.',
    targetDate: 'Dec 2026',
    status: 'planned',
    icon: Speedometer02,
    steps: [
      {
        id: 'p4c-s1',
        title: 'F1 page: tracks, grid, standings (mock data)',
        description:
          'Calendar, driver and constructor standings, and latest results rendered from mock data.',
        status: 'in-progress',
      },
      {
        id: 'p4c-s2',
        title: 'NestJS F1 module via Jolpica/OpenF1 API',
        description:
          'Fetch real schedule, standings, and results from the free Jolpica/OpenF1 APIs through a NestJS module.',
        status: 'planned',
      },
      {
        id: 'p4c-s3',
        title: 'Cron scraper fallback (FastF1 / Cheerio) + Redis cache',
        description:
          'A scheduled scraper backs up the API, storing results in Postgres and caching hot reads in Redis.',
        status: 'planned',
      },
      {
        id: 'p4c-s4',
        title: 'Live race positions via WebSocket',
        description:
          'Push live position changes to the page during a race for a real-time leaderboard.',
        status: 'planned',
      },
      {
        id: 'p4c-s5',
        title: 'Race-day prediction mini-game',
        description:
          'Friends predict the podium before lights out and score points against the real result.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-5',
    title: 'Food Ordering Menu',
    description:
      'Shared menu for organizing meals — per-person orders, cart, and a summary of who wants what.',
    targetDate: 'Dec 2026',
    status: 'planned',
    icon: ShoppingCart01,
    steps: [
      {
        id: 'p5-s1',
        title: 'Shared menu with items and categories',
        description:
          'Build a menu with categories and items everyone in the group can browse.',
        status: 'planned',
      },
      {
        id: 'p5-s2',
        title: 'Per-person order cart',
        description:
          'Each person adds their picks to a personal cart tied to their profile.',
        status: 'planned',
      },
      {
        id: 'p5-s3',
        title: 'Order summary and status',
        description:
          'A combined summary of who ordered what, totals, and a simple status to track the meal.',
        status: 'planned',
      },
      {
        id: 'p5-s4',
        title: 'Menu history and favorites',
        description:
          'Save past menus and favorite dishes to reorder a great night in seconds.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-5b',
    title: 'Backend Real-Time Lab',
    description:
      'Deep-dive learning phase — Redis pub/sub, game state machines, reconnect handling, observability.',
    targetDate: 'Jan 2027',
    status: 'planned',
    icon: CpuChip01,
    steps: [
      {
        id: 'p5b-s1',
        title: 'Redis pub/sub for multi-room game state',
        description:
          'Scale game rooms across processes by broadcasting state changes through Redis pub/sub.',
        status: 'planned',
      },
      {
        id: 'p5b-s2',
        title: 'Reconnect + stale player cleanup',
        description:
          'Gracefully handle dropped connections, rejoin players, and clean up players who never return.',
        status: 'planned',
      },
      {
        id: 'p5b-s3',
        title: 'Structured logging and health metrics',
        description:
          'Add structured logs and health/metrics endpoints so you can see what the server is doing.',
        status: 'planned',
      },
      {
        id: 'p5b-s4',
        title: 'Rate limiting on LLM and invite endpoints',
        description:
          'Protect expensive and sensitive endpoints with per-user rate limits backed by Redis.',
        status: 'planned',
      },
      {
        id: 'p5b-s5',
        title: 'Charades+ and Two Truths & a Lie games',
        description:
          'Two more games that reuse the real-time room engine built earlier in this phase.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-6',
    title: 'Real File Storage',
    description:
      'Replace mock API with NestJS disk storage, Postgres metadata, thumbnails, and local Wi-Fi sharing.',
    targetDate: 'Feb 2027',
    status: 'planned',
    icon: Server01,
    steps: [
      {
        id: 'p6-s1',
        title: 'NestJS upload + disk volume',
        description:
          'Stream uploads to a mounted disk volume with size/type validation instead of the mock store.',
        status: 'planned',
      },
      {
        id: 'p6-s2',
        title: 'Postgres file/folder metadata',
        description:
          'Track files, folders, owners, and sharing in Postgres with proper relations and migrations.',
        status: 'planned',
      },
      {
        id: 'p6-s3',
        title: 'Image thumbnails generation',
        description:
          'Generate thumbnails on upload (via a queue) so galleries load fast.',
        status: 'planned',
      },
      {
        id: 'p6-s4',
        title: 'Local Wi-Fi file sharing',
        description:
          'Share large files across the home network straight from the server, no cloud needed.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-7',
    title: 'Offline-First PWA',
    description:
      'Installable SPA with service worker, offline cache for games and menu, background sync when online.',
    targetDate: 'Mar 2027',
    status: 'planned',
    icon: Wifi,
    steps: [
      {
        id: 'p7-s1',
        title: 'PWA manifest and install prompt',
        description:
          'Add a manifest and icons so HomeKit installs to the home screen like a native app.',
        status: 'planned',
      },
      {
        id: 'p7-s2',
        title: 'Service worker offline cache',
        description:
          'Cache the app shell and key pages so the UI loads even when the Wi-Fi flickers.',
        status: 'planned',
      },
      {
        id: 'p7-s3',
        title: 'Background sync for uploads',
        description:
          'Queue uploads made offline and sync them automatically when the connection returns.',
        status: 'planned',
      },
      {
        id: 'p7-s4',
        title: 'Offline JSON word banks for all games',
        description:
          'Bundle word/quiz banks locally so every game runs with no network and no latency.',
        status: 'planned',
      },
      {
        id: 'p7-s5',
        title: 'Hot Takes game with cached LLM responses',
        description:
          'Pre-generate and cache LLM prompts so the Hot Takes game works offline too.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'phase-8',
    title: 'Multi-Server & Access',
    description:
      'Deployable to other servers, licensed access to start on external hosts, and exposed-port hardening.',
    targetDate: 'Apr 2027+',
    status: 'planned',
    icon: Globe01,
    steps: [
      {
        id: 'p8-s1',
        title: 'One-click deploy to other servers',
        description:
          'A reproducible deploy so a friend can run their own HomeKit instance with one command.',
        status: 'planned',
      },
      {
        id: 'p8-s2',
        title: 'License / bought access system',
        description:
          'Optional paid/licensed access to start instances on external hosts.',
        status: 'planned',
      },
      {
        id: 'p8-s3',
        title: 'Port exposure and security hardening',
        description:
          'Reverse proxy, TLS, secrets management, and safe defaults for exposing ports to the internet.',
        status: 'planned',
      },
      {
        id: 'p8-s4',
        title: 'Multi-tenant instance management',
        description:
          'Manage several instances and tenants from one place with isolation between them.',
        status: 'planned',
      },
    ],
  },
];

export function getPhaseProgress(phase: RoadmapPhase): { completed: number; total: number; percent: number } {
  const total = phase.steps.length;
  const completed = phase.steps.filter((s) => s.status === 'completed').length;
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getOverallProgress(): { completed: number; total: number; percent: number } {
  const allSteps = roadmap.flatMap((p) => p.steps);
  const total = allSteps.length;
  const completed = allSteps.filter((s) => s.status === 'completed').length;
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getStatusLabel(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In progress';
    case 'planned':
      return 'Planned';
  }
}

export function getStatusBadgeColor(status: StepStatus): 'success' | 'brand' | 'gray' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'brand';
    case 'planned':
      return 'gray';
  }
}
