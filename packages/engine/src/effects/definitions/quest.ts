import { EffectDefinition } from '../types';

export const questEffects: EffectDefinition[] = [
  {
    id: 'quest.assign',
    label: 'Assign a Quest to Player',
    description:
      'Assign a quest objective to a player. On completion the reward effect triggers; on failure, the fail effect triggers.',
    module: 'MunchkinPhaseModule',
    category: 'quest',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'choose'],
        defaultValue: 'active_player',
      },
      {
        key: 'quest_type',
        label: 'Quest Type',
        type: 'select',
        options: [
          'Win a combat alone',
          'Sell 3 items',
          'Reach level X',
          'Help 2 players',
          'custom',
        ],
        defaultValue: 'Win a combat alone',
      },
      {
        key: 'quest_custom_text',
        label: 'Custom Quest Text',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'reward_effect',
        label: 'Reward Effect (on success)',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'fail_effect',
        label: 'Fail Effect (on failure)',
        type: 'text',
        defaultValue: '',
      },
    ],
  },
];
