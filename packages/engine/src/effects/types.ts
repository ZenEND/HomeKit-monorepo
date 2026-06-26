export type EffectCategory =
  | 'progress'
  | 'inventory'
  | 'loot'
  | 'turn'
  | 'combat'
  | 'situation'
  | 'quest'
  | 'gm';

export interface EffectParam {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'player_target' | 'text';
  options?: string[];
  defaultValue: unknown;
  min?: number;
  max?: number;
}

export interface EffectDefinition {
  id: string;
  label: string;
  description: string;
  module: string;
  category: EffectCategory;
  params: EffectParam[];
}

export interface EffectInstance {
  definitionId: string;
  params: Record<string, unknown>;
  condition?: EffectCondition;
}

export interface EffectCondition {
  type: 'phase' | 'player_level' | 'has_item' | 'random_percent';
  value: unknown;
}

export interface EffectContext {
  actingPlayerId: string;
  targetPlayerId?: string;
  cardId: string;
}

export type GameState = Record<string, unknown>;
