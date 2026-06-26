import { EffectDefinition } from '../types';

export const progressEffects: EffectDefinition[] = [
  {
    id: 'progress.gain_level',
    label: 'Gain Levels',
    description: 'Target player gains one or more levels.',
    module: 'ProgressModule',
    category: 'progress',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'all', 'choose'],
        defaultValue: 'active_player',
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'progress.lose_level',
    label: 'Lose Levels',
    description: 'Target player loses one or more levels.',
    module: 'ProgressModule',
    category: 'progress',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'all', 'choose'],
        defaultValue: 'active_player',
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'progress.set_level',
    label: 'Set Level To',
    description: 'Sets the target player\'s level to a specific value.',
    module: 'ProgressModule',
    category: 'progress',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'all', 'choose'],
        defaultValue: 'active_player',
      },
      {
        key: 'value',
        label: 'Level Value',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 9,
      },
    ],
  },
];
