import type { EffectInstance } from '@homekit/engine';

// ─── Auth / Roles ────────────────────────────────────────────────────────────

export enum RolesEnum {
  Any = 'ANY',
  Guest = 'GUEST',
  Admin = 'ADMIN',
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export type CardType = 'DOOR' | 'TREASURE' | 'PARTY' | 'SITUATION' | 'MINIGAME';
export type CardStatus = 'draft' | 'published';

export interface CardStats {
  monsterLevel?: number;
  treasureReward?: number;
  badStuff?: string;
  slot?: 'Head' | 'Body' | 'Feet' | 'Hand' | 'Accessory' | 'None';
  combatBonus?: number;
  goldValue?: number;
  bigItem?: boolean;
  raceRestriction?: string[];
  classRestriction?: string[];
  itemBonus?: number;
  itemValue?: number;
}

export interface Card {
  id: string;
  game: string;
  type: CardType;
  subtype?: string;
  name: string;
  description?: string;
  flavorText?: string;
  imageUrl?: string;
  stats?: CardStats;
  effects: EffectInstance[];
  tags?: string[];
  enabled: boolean;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardPayload {
  game?: string;
  type: CardType;
  subtype?: string;
  name: string;
  description?: string;
  flavorText?: string;
  imageUrl?: string;
  stats?: CardStats;
  effects?: EffectInstance[];
  tags?: string[];
  enabled?: boolean;
  status?: CardStatus;
}

export interface CardsQuery {
  type?: CardType;
  subtype?: string;
  tag?: string;
  effectId?: string;
  status?: CardStatus;
  game?: string;
}

// ─── Carry Effects ────────────────────────────────────────────────────────────

export interface CarryEffect {
  id: string;
  playerId: string;
  playerEmail?: string;
  effectLabel: string;
  effectDescription?: string;
  duration: string;
  sourceCardId?: string;
  sourceCardName?: string;
  gameSessionId?: string;
  active: boolean;
  createdAt: string;
}

export interface GmApprovalPayload {
  decision: 'success' | 'fail';
  gameId: string;
  cardId: string;
  playerId: string;
}
