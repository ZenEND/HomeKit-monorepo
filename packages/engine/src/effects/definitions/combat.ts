import { EffectDefinition } from '../types';

export const combatEffects: EffectDefinition[] = [
  {
    id: 'combat.add_power',
    label: 'Add Combat Power',
    description: 'Add combat power to a player or monster.',
    module: 'CombatModule',
    category: 'combat',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'monster', 'all'],
        defaultValue: 'active_player',
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 10,
      },
    ],
  },
  {
    id: 'combat.subtract_power',
    label: 'Subtract Combat Power',
    description: 'Reduce combat power of a player or monster.',
    module: 'CombatModule',
    category: 'combat',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'monster', 'all'],
        defaultValue: 'active_player',
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 10,
      },
    ],
  },
  {
    id: 'combat.auto_win',
    label: 'Auto-Win Combat',
    description: 'Automatically win combat under specific conditions.',
    module: 'CombatModule',
    category: 'combat',
    params: [
      {
        key: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['vs_undead', 'vs_animal', 'always'],
        defaultValue: 'always',
      },
    ],
  },
  {
    id: 'combat.auto_flee',
    label: 'Escape Without Roll',
    description: 'Automatically escape combat without needing to roll.',
    module: 'CombatModule',
    category: 'combat',
    params: [],
  },
];
