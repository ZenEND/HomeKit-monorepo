import { ActivityIdeasPage } from '@/features/plans/components/activity-ideas-page';
import { cookingIdeas } from '@/lib/plans/cooking-ideas';

export function CookingPage() {
  return (
    <ActivityIdeasPage
      activityType="cooking"
      titleKey="plans.cookingTitle"
      subtitleKey="plans.cookingSubtitle"
      ideas={cookingIdeas}
    />
  );
}
