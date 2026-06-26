export interface ActivityIdea {
  id: string;
  title: string;
  emoji: string;
  vibe: string;
  groupSize: string;
  summary: string;
  howItWorks: string[];
  homekitTieIn: string;
}

export { partyIdeas as partyActivityIdeas } from '@/lib/parties/party-ideas';
export { racingIdeas } from './racing-ideas';
export { cookingIdeas } from './cooking-ideas';
export { boardGameIdeas } from './boardgame-ideas';
export { partyGameIdeas } from './partygame-ideas';
