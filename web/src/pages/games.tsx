import { Link } from 'react-router-dom';
import { CpuChip01, PuzzlePiece01, Stars01 } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card/card';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import { freeLlmOptions, gameCatalog, llmStrategyNote } from '@/lib/roadmap/roadmap-ideas';
import {
  llmStrategyNoteUa,
  localizeGameIdea,
  localizeLlmOption,
} from '@/lib/roadmap/roadmap-ideas-i18n';

export function Games() {
  const { t, language } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-4">
        <FeaturedIcon icon={PuzzlePiece01} color="brand" theme="gradient" size="lg" />
        <div>
          <Badge color="brand" size="sm" className="w-fit">
            {t('games.coming')}
          </Badge>
          <h1 className="mt-3 text-display-sm font-semibold text-primary">{t('games.title')}</h1>
          <p className="mt-2 max-w-2xl text-md text-tertiary">{t('games.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button color="primary" size="md" href="/alias">
            Play Alias
          </Button>
          <Button color="secondary" size="md" href="/roadmap">
            {t('games.viewRoadmap')}
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FeaturedIcon icon={Stars01} color="brand" theme="light" size="sm" />
          <h2 className="text-lg font-semibold text-primary">{t('games.planned')}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {gameCatalog.map((game) => {
            const localized = localizeGameIdea(game, language);
            return (
              <Card key={game.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">{localized.name}</CardTitle>
                    <Badge color="gray" size="sm">
                      {localized.players}
                    </Badge>
                  </div>
                  <CardDescription>{localized.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <p className="text-xs text-quaternary">
                    <span className="font-medium text-tertiary">{t('games.backendSkill')}:</span>{' '}
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
        <div className="flex items-center gap-2">
          <FeaturedIcon icon={CpuChip01} color="brand" theme="light" size="sm" />
          <h2 className="text-lg font-semibold text-primary">{t('games.freeLlm')}</h2>
        </div>
        <p className="text-sm text-tertiary">
          {language === 'ua' ? llmStrategyNoteUa : llmStrategyNote}
        </p>
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

      <Card>
        <CardContent className="py-5">
          <p className="text-sm text-secondary">
            {t('games.firstPlayablePrefix')}{' '}
            <strong className="font-medium text-primary">
              {language === 'ua' ? 'Крокодил' : 'Crocodile'}
            </strong>{' '}
            {t('games.firstPlayableSuffix')}
          </p>
          <Link to="/roadmap" className="mt-3 inline-block text-sm font-medium text-brand-secondary">
            {t('games.seeBackendTrack')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
