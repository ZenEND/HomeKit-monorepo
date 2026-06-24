import type { ActivityIdea } from './activity-ideas';

export const cookingIdeas: ActivityIdea[] = [
  {
    id: 'themed-dinner',
    title: 'Themed Dinner Night',
    emoji: '🍝',
    vibe: 'Cozy + tasty',
    groupSize: '2–8',
    summary:
      'Pick a cuisine, everyone orders or cooks a dish, and the shared menu tracks who brings what.',
    howItWorks: [
      'Vote on a theme: Italian, sushi, taco night, etc.',
      'Build the shared menu and claim dishes',
      'Set a time and location on Plans',
      'Rate each dish afterwards for the hall of fame',
    ],
    homekitTieIn: 'Uses Food + Plans pages; ratings feed menu favorites.',
  },
  {
    id: 'cook-off',
    title: 'Friendly Cook-Off',
    emoji: '👨‍🍳',
    vibe: 'Competitive + fun',
    groupSize: '4–10',
    summary: 'Same secret ingredient, timed rounds, blind tasting and scorecards.',
    howItWorks: [
      'Draw a secret ingredient everyone must use',
      'Set a 45-minute timer',
      'Blind taste and score on presentation, taste, creativity',
      'Reveal the winner on the big screen',
    ],
    homekitTieIn: 'Scorecards can tie into Games engine later.',
  },
  {
    id: 'brunch-club',
    title: 'Sunday Brunch Club',
    emoji: '🥞',
    vibe: 'Lazy + delicious',
    groupSize: '3–8',
    summary: 'Rotating host, everyone brings one dish, shared playlist and coffee.',
    howItWorks: [
      'Rotate hosts monthly',
      'Each guest brings one dish or drink',
      'Create a shared playlist for the morning',
      'Save favorite recipes to Storage',
    ],
    homekitTieIn: 'Save recipes and brunch dates in Plans.',
  },
  {
    id: 'baking-night',
    title: 'Baking Night',
    emoji: '🧁',
    vibe: 'Sweet + creative',
    groupSize: '2–6',
    summary: 'Pick one bake (cookies, cinnamon rolls, pizza dough) and do it together.',
    howItWorks: [
      'Vote on what to bake',
      'Split prep tasks on a checklist',
      'Document the process with photos',
      'Share the results (and failures) afterwards',
    ],
    homekitTieIn: 'Checklist and photos tie into Storage.',
  },
];
