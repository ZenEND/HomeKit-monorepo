import { ActivityIdeasPage } from '@/features/plans/components/activity-ideas-page';
import { partyActivityIdeas } from '@/lib/plans/activity-ideas';

export function PartiesPage() {
  return (
    <ActivityIdeasPage
      activityType="party"
      titleKey="plans.partiesTitle"
      subtitleKey="plans.partiesSubtitle"
      ideas={partyActivityIdeas}
    />
  );
}
