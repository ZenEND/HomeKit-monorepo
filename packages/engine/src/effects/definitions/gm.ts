import { EffectDefinition } from '../types';

export const gmEffects: EffectDefinition[] = [
  {
    id: 'gm.real_life_challenge',
    label: 'Real-Life Challenge (GM must approve)',
    description:
      'Card is played → challenge shown on all screens. Game pauses for GM to approve success or failure. Reward or fail effect is then applied.',
    module: 'GMModule',
    category: 'gm',
    params: [
      {
        key: 'challenge_text',
        label: 'Challenge Text',
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
      {
        key: 'timeout_seconds',
        label: 'Timeout (seconds)',
        type: 'number',
        defaultValue: 60,
        min: 30,
        max: 300,
      },
    ],
  },
  {
    id: 'gm.cross_game_effect',
    label: 'Cross-Game Carry Effect (GM must approve)',
    description:
      'On GM approval, this effect is stored on the player\'s persistent profile and applied at the start of the next game session.',
    module: 'GMModule',
    category: 'gm',
    params: [
      {
        key: 'description',
        label: 'Effect Description',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'effect_label',
        label: 'Effect Label (shown in future game UI)',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'select',
        options: ['this_game', 'next_game', 'permanent'],
        defaultValue: 'next_game',
      },
    ],
  },
];
