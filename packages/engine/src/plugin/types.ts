import type { EffectDefinition } from '../effects/types';

export interface ActionContext {
  playerId: string;
  timestamp: number;
  /** Injected RNG for deterministic testing. Returns [0, 1). */
  random: () => number;
}

export interface GameConfig {
  roomId: string;
  playerIds: string[];
  playerNames: Record<string, string>;
  settings: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/** Describes a single tab shown in the admin game builder */
export interface BuilderTab {
  id: string;
  label: string;
  /** Card type filter (e.g. 'DOOR', 'TREASURE') */
  cardType?: string;
  /** Card subtype filter */
  cardSubtype?: string;
  /** Whether this tab edits game settings rather than card selection */
  isSettings?: boolean;
}

export interface GamePlugin<S = unknown, A = unknown> {
  /** Unique plugin identifier, e.g. "munchkin" */
  readonly id: string;
  readonly name: string;
  readonly version: string;
  /** Effect definitions this plugin registers into the global EffectRegistry */
  readonly effects: EffectDefinition[];
  /** Optional tabs rendered in the admin game builder */
  readonly builderTabs?: BuilderTab[];

  /** Build a fresh game state for a new room */
  initialState(config: GameConfig): S;

  /** Pure reducer — MUST NOT produce side effects */
  applyAction(state: S, action: A, context: ActionContext): S;

  /** Server-side validation before executing an action */
  validateAction(state: S, action: A, playerId: string): ValidationResult;

  /** Returns winning playerId or null if game is still ongoing */
  computeWinner(state: S): string | null;
}
