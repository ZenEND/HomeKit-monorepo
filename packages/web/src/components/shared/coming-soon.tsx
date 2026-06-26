import type { FC } from 'react';
import { ArrowRight } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';

interface ComingSoonProps {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
  targetDate: string;
  features: string[];
}

export function ComingSoon({ icon, title, description, targetDate, features }: ComingSoonProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center">
      <FeaturedIcon icon={icon} color="brand" theme="light" size="xl" />
      <Badge color="brand" size="md" className="mt-6">
        {t('comingSoon.target')}: {targetDate}
      </Badge>
      <h1 className="mt-4 text-display-xs font-semibold text-primary">{title}</h1>
      <p className="mt-3 max-w-lg text-md text-tertiary">{description}</p>

      <ul className="mt-8 flex w-full flex-col gap-3 text-left">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 rounded-lg border border-secondary bg-primary px-4 py-3 text-sm text-secondary"
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-solid" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <Button href="/roadmap" color="primary" size="md" className="mt-8" iconTrailing={ArrowRight}>
        {t('comingSoon.viewRoadmap')}
      </Button>
    </div>
  );
}
