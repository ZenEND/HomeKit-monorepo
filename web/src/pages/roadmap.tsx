import { useMemo, useState } from 'react';
import { Check, Rocket01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card/card';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  getOverallProgress,
  getPhaseProgress,
  getStatusBadgeColor,
  roadmap,
  type RoadmapPhase,
  type StepStatus,
} from '@/lib/roadmap/roadmap-data';
import { localizePhase, localizeStep } from '@/lib/roadmap/roadmap-i18n';
import {
  backendLearningTrack,
  freeLlmOptions,
  gameCatalog,
  llmStrategyNote,
  visionPrinciples,
} from '@/lib/roadmap/roadmap-ideas';
import {
  llmStrategyNoteUa,
  localizeBackendItem,
  localizeGameIdea,
  localizeLlmOption,
  localizeVisionPrinciple,
} from '@/lib/roadmap/roadmap-ideas-i18n';
import { cx } from '@/utils/cx';

type StatusFilter = 'all' | StepStatus;

function statusKey(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'roadmap.statusCompleted';
    case 'in-progress':
      return 'roadmap.statusInProgress';
    case 'planned':
      return 'roadmap.statusPlanned';
  }
}

function ProgressBar({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-tertiary', className)}>
      <div
        className="h-full rounded-full bg-brand-solid transition-all duration-300 ease-linear"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const { t, language } = useTranslation();
  const progress = getPhaseProgress(phase);
  const Icon = phase.icon;
  const phaseText = localizePhase(phase, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <FeaturedIcon icon={Icon} color="brand" theme="light" size="md" />
              <div>
                <CardTitle>{phaseText.title}</CardTitle>
                <CardDescription className="mt-1">{phaseText.description}</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="brand" size="sm">
                {phase.targetDate}
              </Badge>
              <BadgeWithDot color={getStatusBadgeColor(phase.status)} type="pill-color" size="sm">
                {t(statusKey(phase.status))}
              </BadgeWithDot>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-tertiary">
              <span>
                {t('roadmap.stepsSummary', { completed: progress.completed, total: progress.total })}
              </span>
              <span>{progress.percent}%</span>
            </div>
            <ProgressBar percent={progress.percent} />
          </div>

          <ul className="flex flex-col gap-3">
            {phase.steps.map((step) => {
              const stepText = localizeStep(step, language);
              return (
                <li key={step.id} className="flex items-start gap-2.5 text-sm">
                  {step.status === 'completed' ? (
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-fg-success-secondary"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className={cx(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        step.status === 'in-progress' ? 'bg-brand-solid' : 'bg-quaternary',
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cx(
                        'font-medium',
                        step.status === 'completed' ? 'text-tertiary line-through' : 'text-secondary',
                      )}
                    >
                      {stepText.title}
                    </span>
                    <span className="text-xs text-tertiary">{stepText.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Roadmap() {
  const { t, language } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const overall = getOverallProgress();

  const filteredPhases = useMemo(() => {
    if (statusFilter === 'all') return roadmap;
    return roadmap.filter((phase) => phase.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-4">
        <FeaturedIcon icon={Rocket01} color="brand" theme="gradient" size="lg" />
        <div>
          <h1 className="text-display-sm font-semibold text-primary">{t('roadmap.title')}</h1>
          <p className="mt-2 max-w-2xl text-md text-tertiary">{t('roadmap.subtitle')}</p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">{t('roadmap.overallProgress')}</span>
              <span className="text-sm text-tertiary">
                {t('roadmap.stepsSummaryDot', {
                  completed: overall.completed,
                  total: overall.total,
                  percent: overall.percent,
                })}
              </span>
            </div>
            <ProgressBar percent={overall.percent} />
          </CardContent>
        </Card>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-primary">{t('roadmap.principlesTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {visionPrinciples.map((principle) => {
            const localized = localizeVisionPrinciple(principle, language);
            return (
              <Card key={principle.id}>
                <CardContent className="flex gap-3 py-5">
                  <FeaturedIcon icon={principle.icon} color="brand" theme="light" size="sm" />
                  <div>
                    <p className="text-sm font-medium text-primary">{localized.title}</p>
                    <p className="mt-1 text-sm text-tertiary">{localized.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">{t('roadmap.gameCatalogTitle')}</h2>
          <p className="mt-1 text-sm text-tertiary">{t('roadmap.gameCatalogSubtitle')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {gameCatalog.map((game) => {
            const localized = localizeGameIdea(game, language);
            return (
              <Card key={game.id}>
                <CardContent className="flex flex-col gap-2 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary">{localized.name}</p>
                    <Badge color="gray" size="sm">
                      {localized.players}
                    </Badge>
                  </div>
                  <p className="text-sm text-tertiary">{localized.tagline}</p>
                  <p className="text-xs text-quaternary">
                    <span className="font-medium text-tertiary">{t('roadmap.learnLabel')}:</span>{' '}
                    {localized.backendSkill}
                  </p>
                  <Badge color="brand" size="sm" className="w-fit">
                    {localized.targetPhase}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">{t('roadmap.backendTitle')}</h2>
          <p className="mt-1 text-sm text-tertiary">{t('roadmap.backendSubtitle')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {backendLearningTrack.map((item) => {
            const localized = localizeBackendItem(item, language);
            return (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <p className="text-sm font-medium text-primary">{localized.topic}</p>
                  <p className="mt-1 text-sm text-tertiary">{localized.why}</p>
                  <p className="mt-2 text-xs text-quaternary">
                    <span className="font-medium text-tertiary">{t('roadmap.usedInLabel')}:</span>{' '}
                    {localized.usedIn}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">{t('roadmap.llmTitle')}</h2>
          <p className="mt-1 text-sm text-tertiary">
            {language === 'ua' ? llmStrategyNoteUa : llmStrategyNote}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {freeLlmOptions.map((option) => {
            const localized = localizeLlmOption(option, language);
            return (
              <Card key={option.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary">{localized.name}</p>
                    <Badge color="success" size="sm">
                      {localized.cost}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-secondary">{localized.bestFor}</p>
                  <p className="mt-1 text-xs text-tertiary">{localized.notes}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-primary">{t('roadmap.milestonesTitle')}</h2>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-secondary">{t('roadmap.filterByStatus')}</p>
          <ButtonGroup
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              if (
                selected === 'all' ||
                selected === 'completed' ||
                selected === 'in-progress' ||
                selected === 'planned'
              ) {
                setStatusFilter(selected);
              }
            }}
          >
            <ButtonGroupItem id="all">{t('roadmap.statusAll')}</ButtonGroupItem>
            <ButtonGroupItem id="completed">{t('roadmap.statusCompleted')}</ButtonGroupItem>
            <ButtonGroupItem id="in-progress">{t('roadmap.statusInProgress')}</ButtonGroupItem>
            <ButtonGroupItem id="planned">{t('roadmap.statusPlanned')}</ButtonGroupItem>
          </ButtonGroup>
        </div>

        <div className="flex flex-col gap-6">
          {filteredPhases.map((phase, index) => (
            <PhaseCard key={phase.id} phase={phase} index={index} />
          ))}
          {filteredPhases.length === 0 && (
            <p className="py-8 text-center text-md text-tertiary">{t('roadmap.noPhases')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
