import { Stars01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { Badge } from '@/components/base/badges/badges';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card/card';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import { localizePartyIdea, partyIdeas, type PartyIdea } from '@/lib/parties/party-ideas';

function PartyCard({ idea, index }: { idea: PartyIdea; index: number }) {
  const { t, language } = useTranslation();
  const localized = localizePartyIdea(idea, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">
                {idea.emoji}
              </span>
              <div>
                <CardTitle className="text-base">{localized.title}</CardTitle>
                <CardDescription className="mt-1">{localized.vibe}</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="gray" size="sm">
                {localized.groupSize} {t('common.people')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-secondary">{localized.summary}</p>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-quaternary">
              {t('parties.howItWorks')}
            </p>
            <ul className="flex flex-col gap-1.5">
              {localized.howItWorks.map((step) => (
                <li key={step} className="flex items-start gap-2 text-sm text-secondary">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-solid" aria-hidden="true" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-tertiary">
            <span className="font-medium text-secondary">{t('parties.tieIn')}:</span>{' '}
            {localized.homekitTieIn}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Parties() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <FeaturedIcon icon={Stars01} color="brand" theme="gradient" size="lg" />
        <div>
          <h1 className="text-display-sm font-semibold text-primary">{t('parties.title')}</h1>
          <p className="mt-2 max-w-2xl text-md text-tertiary">{t('parties.subtitle')}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {partyIdeas.map((idea, index) => (
          <PartyCard key={idea.id} idea={idea} index={index} />
        ))}
      </div>
    </div>
  );
}
