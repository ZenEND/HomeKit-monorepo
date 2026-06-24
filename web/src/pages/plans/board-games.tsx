import { ActivityIdeasPage } from '@/features/plans/components/activity-ideas-page';
import { boardGameIdeas } from '@/lib/plans/boardgame-ideas';

export function BoardGamesPage() {
  return (
    <ActivityIdeasPage
      activityType="boardgame"
      titleKey="plans.boardGamesTitle"
      subtitleKey="plans.boardGamesSubtitle"
      ideas={boardGameIdeas}
    />
  );
}
