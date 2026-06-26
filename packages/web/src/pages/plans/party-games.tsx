import { ActivityIdeasPage } from '@/features/plans/components/activity-ideas-page';
import { partyGameIdeas } from '@/lib/plans/partygame-ideas';

export function PartyGamesPage() {
  return (
    <ActivityIdeasPage
      activityType="partygame"
      titleKey="plans.partyGamesTitle"
      subtitleKey="plans.partyGamesSubtitle"
      ideas={partyGameIdeas}
    />
  );
}
