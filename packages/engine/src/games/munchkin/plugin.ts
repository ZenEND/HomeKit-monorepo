import type { EffectDefinition } from '../../effects/types';
import type { ActionContext, GameConfig, GamePlugin, ValidationResult } from '../../plugin/types';
import type { MunchkinAction, MunchkinGameState } from './types';
import { DEFAULT_GAME_SETTINGS } from './constants';
import { buildInitialState, applyMunchkinAction } from './reducer';
import { ALL_MUNCHKIN_CARDS } from './seed-data';

// ── Munchkin-specific effects registered with the global EffectRegistry ────────

export const MUNCHKIN_EFFECTS: EffectDefinition[] = [
  {
    id: 'munchkin.combat.boost',
    label: 'Combat Boost',
    description: 'Add power to the active player\'s combat total.',
    module: 'munchkin',
    category: 'combat',
    params: [
      { key: 'amount', label: 'Amount', type: 'number', defaultValue: 1, min: 1, max: 10 },
    ],
  },
  {
    id: 'munchkin.progress.gain_level',
    label: 'Gain Level',
    description: 'The target player gains levels.',
    module: 'munchkin',
    category: 'progress',
    params: [
      { key: 'target', label: 'Target', type: 'player_target', defaultValue: 'active_player' },
      { key: 'amount', label: 'Amount', type: 'number', defaultValue: 1, min: 1, max: 3 },
    ],
  },
  {
    id: 'munchkin.progress.lose_level',
    label: 'Lose Level',
    description: 'The target player loses levels.',
    module: 'munchkin',
    category: 'progress',
    params: [
      { key: 'target', label: 'Target', type: 'player_target', defaultValue: 'active_player' },
      { key: 'amount', label: 'Amount', type: 'number', defaultValue: 1, min: 1, max: 3 },
    ],
  },
  {
    id: 'munchkin.loot.draw_treasure',
    label: 'Draw Treasure',
    description: 'Target player draws Treasure cards.',
    module: 'munchkin',
    category: 'loot',
    params: [
      { key: 'target', label: 'Target', type: 'player_target', defaultValue: 'active_player' },
      { key: 'count', label: 'Count', type: 'number', defaultValue: 1, min: 1, max: 3 },
    ],
  },
  {
    id: 'munchkin.turn.skip',
    label: 'Skip Turn',
    description: 'The next player\'s turn is skipped.',
    module: 'munchkin',
    category: 'turn',
    params: [
      { key: 'target', label: 'Target', type: 'select', defaultValue: 'next', options: ['next', 'choose'] },
    ],
  },
];

// ── Plugin Implementation ─────────────────────────────────────────────────────

export const MunchkinPlugin: GamePlugin<MunchkinGameState, MunchkinAction> = {
  id: 'munchkin',
  name: 'Munchkin Party',
  version: '1.0.0',
  effects: MUNCHKIN_EFFECTS,
  builderTabs: [
    { id: 'doors', label: 'Doors', cardType: 'DOOR' },
    { id: 'loot', label: 'Loot', cardType: 'TREASURE' },
    { id: 'classes', label: 'Classes', cardType: 'PARTY', cardSubtype: 'class' },
    { id: 'situations', label: 'Common random situations', cardType: 'SITUATION' },
    { id: 'settings', label: 'Game settings', isSettings: true },
  ],

  initialState(config: GameConfig): MunchkinGameState {
    const settings = {
      ...DEFAULT_GAME_SETTINGS,
      ...(config.settings as Partial<typeof DEFAULT_GAME_SETTINGS>),
    };
    return buildInitialState(
      config.roomId,
      config.playerIds,
      config.playerNames,
      settings,
    );
  },

  applyAction(
    state: MunchkinGameState,
    action: MunchkinAction,
    context: ActionContext,
  ): MunchkinGameState {
    return applyMunchkinAction(state, action, context);
  },

  validateAction(
    state: MunchkinGameState,
    action: MunchkinAction,
    playerId: string,
  ): ValidationResult {
    if (state.phase === 'GAME_OVER') {
      return { valid: false, reason: 'Game is over.' };
    }
    if (state.phase === 'WAITING') {
      return { valid: false, reason: 'Game has not started yet.' };
    }

    const isActivePlayer = state.activePlayerId === playerId;

    // Actions that require being the active player
    const activeOnlyActions: MunchkinAction['type'][] = [
      'KICK_DOOR', 'FIGHT', 'FLEE', 'LOOT_ROOM', 'CHARITY_DONE',
      'END_TURN', 'BOSS_RAID_FIGHT', 'BOSS_RAID_FLEE', 'START_AUCTION',
      'ROLL_DICE', 'RESOLVE_DOOR_EVENT',
    ];

    if (activeOnlyActions.includes(action.type) && !isActivePlayer) {
      return { valid: false, reason: 'Not your turn.' };
    }

    const player = state.players[playerId];
    if (!player) {
      return { valid: false, reason: 'Player not found in game state.' };
    }

    return { valid: true };
  },

  computeWinner(state: MunchkinGameState): string | null {
    if (state.winnerId) return state.winnerId;
    const maxLevel = state.settings.maxLevel;
    for (const [id, player] of Object.entries(state.players)) {
      if (player.level >= maxLevel) return id;
    }
    return null;
  },
};

// ── Seed Data Export ──────────────────────────────────────────────────────────

export { ALL_MUNCHKIN_CARDS };
