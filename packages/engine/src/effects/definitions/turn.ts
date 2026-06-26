import { EffectDefinition } from '../types';

export const turnEffects: EffectDefinition[] = [
  {
    id: 'turn.skip_player',
    label: "Skip Next Player's Turn",
    description: "The next player (or chosen player) skips their next turn.",
    module: 'TurnModule',
    category: 'turn',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'select',
        options: ['next', 'choose'],
        defaultValue: 'next',
      },
    ],
  },
  {
    id: 'turn.extra_turn',
    label: 'Grant Extra Turn',
    description: 'The target player gets an extra turn after this one.',
    module: 'TurnModule',
    category: 'turn',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'choose'],
        defaultValue: 'active_player',
      },
    ],
  },
  {
    id: 'turn.reverse_order',
    label: 'Reverse Turn Order',
    description: 'Reverse the turn order for the rest of this round or permanently.',
    module: 'TurnModule',
    category: 'turn',
    params: [
      {
        key: 'duration',
        label: 'Duration',
        type: 'select',
        options: ['this_round', 'permanent'],
        defaultValue: 'this_round',
      },
    ],
  },
];
