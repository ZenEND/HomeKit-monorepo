import { EffectDefinition } from '../types';

export const lootEffects: EffectDefinition[] = [
  {
    id: 'loot.draw_card',
    label: 'Draw Cards',
    description: 'Draw cards from a specified deck.',
    module: 'LootModule',
    category: 'loot',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'all', 'choose'],
        defaultValue: 'active_player',
      },
      {
        key: 'deck',
        label: 'Deck',
        type: 'select',
        options: ['door', 'treasure', 'party'],
        defaultValue: 'treasure',
      },
      {
        key: 'count',
        label: 'Count',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 3,
      },
    ],
  },
  {
    id: 'loot.discard_hand',
    label: 'Discard Hand Cards',
    description: 'Force a player to discard cards from their hand.',
    module: 'LootModule',
    category: 'loot',
    params: [
      {
        key: 'target',
        label: 'Target',
        type: 'player_target',
        options: ['active_player', 'all', 'choose'],
        defaultValue: 'active_player',
      },
      {
        key: 'count',
        label: 'Count',
        type: 'select',
        options: ['1', '2', '3', '4', '5', 'all'],
        defaultValue: '1',
      },
      {
        key: 'deck_target',
        label: 'Deck Target',
        type: 'select',
        options: ['door', 'treasure'],
        defaultValue: 'door',
      },
    ],
  },
  {
    id: 'loot.swap_hands',
    label: 'Swap Hands',
    description: 'Swap hand cards between players.',
    module: 'LootModule',
    category: 'loot',
    params: [
      {
        key: 'between',
        label: 'Between',
        type: 'select',
        options: ['left', 'right', 'random', 'choose'],
        defaultValue: 'random',
      },
    ],
  },
];
