import { ActivityIdeasPage } from '@/features/plans/components/activity-ideas-page';
import { racingIdeas } from '@/lib/plans/racing-ideas';

export function RacingPage() {
  return (
    <ActivityIdeasPage
      activityType="racing"
      titleKey="plans.racingTitle"
      subtitleKey="plans.racingSubtitle"
      ideas={racingIdeas}
    />
  );
}
