import { EffectDefinition } from '../types';

export const situationEffects: EffectDefinition[] = [
  {
    id: 'situation.no_effect',
    label: 'No Game Effect — Funny Situation',
    description:
      'Card is read aloud, players react, life goes on. Used for pure humor / party flavor cards with no mechanical consequence.',
    module: 'SituationModule',
    category: 'situation',
    params: [],
  },
];
