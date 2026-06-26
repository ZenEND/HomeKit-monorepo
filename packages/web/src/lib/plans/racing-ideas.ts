import type { ActivityIdea } from './activity-ideas';

export const racingIdeas: ActivityIdea[] = [
  {
    id: 'f1-watch-party',
    title: 'F1 Race-Day Watch Party',
    emoji: '🏎️',
    vibe: 'Adrenaline + snacks',
    groupSize: '3–10',
    summary:
      'Gather for a Grand Prix with a live standings screen, a prediction pool, and themed snacks per team.',
    howItWorks: [
      'Open the F1 page on the TV for the grid and live positions',
      'Everyone picks a podium prediction before lights out',
      'Award silly prizes for closest guess and worst guess',
      'Pit-stop snack breaks during safety cars',
    ],
    homekitTieIn: 'Uses the Formula 1 Fun page; add a prediction mini-game later.',
  },
  {
    id: 'motogp-brunch',
    title: 'MotoGP Sunday Brunch',
    emoji: '🏍️',
    vibe: 'Relaxed + fast bikes',
    groupSize: '2–6',
    summary: 'Sunday morning MotoGP with brunch and a simple fastest-lap prediction sheet.',
    howItWorks: [
      'Stream the race on the big screen',
      'Everyone picks fastest lap rider before the race',
      'Brunch potluck with themed dishes',
      'Score predictions on a shared sheet',
    ],
    homekitTieIn: 'Extend the Racing section with MotoGP calendar later.',
  },
  {
    id: 'wrc-rally-night',
    title: 'WRC Rally Highlights Night',
    emoji: '🌲',
    vibe: 'Dusty + dramatic',
    groupSize: '2–8',
    summary: 'Watch rally stage highlights with a map on screen and guess stage winners.',
    howItWorks: [
      'Queue up the best stages from the latest rally',
      'Show the stage map on a second screen',
      'Guess the stage winner before each highlight',
      'Crown the rally trivia champion',
    ],
    homekitTieIn: 'Pairs with Racing plans and future WRC calendar sync.',
  },
  {
    id: 'endurance-watch',
    title: '24h Endurance Watch',
    emoji: '⏱️',
    vibe: 'Marathon + cozy',
    groupSize: '4–12',
    summary: 'Le Mans or Daytona — rotate shifts, keep a snack station, and track pit stops.',
    howItWorks: [
      'Split into watch shifts with a shared schedule',
      'Set up a snack and coffee station',
      'Track safety cars and weather changes',
      'Morning recap with best moments reel',
    ],
    homekitTieIn: 'Save the event to Plans and share shift assignments.',
  },
];
