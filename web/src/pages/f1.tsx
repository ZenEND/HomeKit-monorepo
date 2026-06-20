import { useState } from 'react';
import { Flag04, Speedometer02, Trophy01, Users01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Card, CardContent } from '@/components/base/card/card';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  constructorStandings,
  driverStandings,
  f1Calendar,
  f1DataSources,
  getNextRace,
  getSeasonProgress,
  lastRaceNameUa,
  lastRaceName,
  lastRacePositions,
  localizeF1DataSource,
} from '@/lib/f1/f1-data';
import { cx } from '@/utils/cx';

type Tab = 'tracks' | 'grid' | 'positions' | 'data';

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-tertiary">
      <div className="h-full rounded-full bg-brand-solid transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function trackBadgeColor(status: string): 'success' | 'brand' | 'gray' {
  if (status === 'completed') return 'success';
  if (status === 'next') return 'brand';
  return 'gray';
}

function TracksTab() {
  const { t } = useTranslation();
  const progress = getSeasonProgress();
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">{t('f1.seasonProgress')}</span>
            <span className="text-sm text-tertiary">
              {t('f1.racesProgress', progress)}
            </span>
          </div>
          <ProgressBar percent={progress.percent} />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {f1Calendar.map((track) => (
          <Card key={track.round} className={cx(track.status === 'next' && 'ring-2 ring-brand-solid')}>
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">
                    {track.flag}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      R{track.round} · {track.name}
                    </p>
                    <p className="text-xs text-tertiary">{track.circuit}</p>
                  </div>
                </div>
                <BadgeWithDot color={trackBadgeColor(track.status)} type="pill-color" size="sm">
                  {track.status === 'next'
                    ? t('f1.next')
                    : track.status === 'completed'
                      ? t('f1.done')
                      : t('f1.upcoming')}
                </BadgeWithDot>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-quaternary">
                <span>{track.date}</span>
                <span>·</span>
                <span>{track.laps} {t('f1.laps')}</span>
                <span>·</span>
                <span>{track.lengthKm} km</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GridTab() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">{t('f1.driverStandings')}</h3>
        <Card>
          <ul className="divide-y divide-secondary">
            {driverStandings.map((d) => (
              <li key={d.number} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-center text-sm font-semibold text-tertiary">{d.position}</span>
                <span className="text-lg" aria-hidden="true">
                  {d.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{d.name}</p>
                  <p className="truncate text-xs text-tertiary">
                    #{d.number} · {d.team}
                  </p>
                </div>
                {d.wins > 0 && (
                  <Badge color="warning" size="sm">
                    {d.wins} {d.wins === 1 ? t('f1.win') : t('f1.wins')}
                  </Badge>
                )}
                <span className="w-14 text-right text-sm font-semibold text-primary">
                  {d.points} {t('f1.points')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">{t('f1.constructorStandings')}</h3>
        <div className="flex flex-col gap-2">
          {constructorStandings.map((c) => {
            const max = constructorStandings[0].points;
            return (
              <Card key={c.team}>
                <CardContent className="flex items-center gap-3 py-3">
                  <span className="w-6 text-center text-sm font-semibold text-tertiary">{c.position}</span>
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">{c.team}</p>
                      <span className="text-sm font-semibold text-primary">
                        {c.points} {t('f1.points')}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-tertiary">
                      <div className="h-full rounded-full" style={{ width: `${(c.points / max) * 100}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PositionsTab() {
  const { t, language } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FeaturedIcon icon={Flag04} color="brand" theme="light" size="sm" />
        <div>
          <p className="text-sm font-medium text-primary">{t('f1.latestResult')}</p>
          <p className="text-xs text-tertiary">{language === 'ua' ? lastRaceNameUa : lastRaceName}</p>
        </div>
      </div>
      <Card>
        <ul className="divide-y divide-secondary">
          {lastRacePositions.map((r) => (
            <li key={r.position} className="flex items-center gap-3 px-4 py-3">
              <span
                className={cx(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  r.position === 1 && 'bg-utility-yellow-100 text-utility-yellow-700',
                  r.position === 2 && 'bg-utility-neutral-100 text-utility-neutral-700',
                  r.position === 3 && 'bg-utility-orange-100 text-utility-orange-700',
                  r.position > 3 && 'bg-secondary text-tertiary',
                )}
              >
                {r.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{r.driver}</p>
                <p className="truncate text-xs text-tertiary">{r.team}</p>
              </div>
              {r.fastestLap && (
                <Badge color="brand" size="sm">
                  {t('f1.fastestLap')}
                </Badge>
              )}
              <span className="w-24 text-right font-mono text-xs text-secondary">{r.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function DataTab() {
  const { t, language } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-tertiary">{t('f1.dataIntro')}</p>
      {f1DataSources.map((src) => {
        const localized = localizeF1DataSource(src, language);
        return (
          <Card key={src.id}>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-primary">{localized.name}</p>
                  <Badge color={src.type === 'api' ? 'brand' : 'gray'} size="sm">
                    {src.type === 'api' ? t('f1.api') : t('f1.scraper')}
                  </Badge>
                </div>
                <Badge color="success" size="sm">
                  {localized.cost}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-secondary">{localized.notes}</p>
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-medium text-brand-secondary"
              >
                {src.url}
              </a>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function F1() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('tracks');
  const nextRace = getNextRace();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <FeaturedIcon icon={Speedometer02} color="brand" theme="gradient" size="lg" />
        <div>
          <h1 className="text-display-sm font-semibold text-primary">{t('f1.title')}</h1>
          <p className="mt-2 max-w-2xl text-md text-tertiary">{t('f1.subtitle')}</p>
        </div>
        {nextRace && (
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <span className="text-2xl" aria-hidden="true">
                {nextRace.flag}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-quaternary">{t('f1.nextRace')}</p>
                <p className="text-sm font-medium text-primary">
                  {nextRace.name} · {nextRace.circuit}
                </p>
              </div>
              <Badge color="brand" size="md" className="ml-auto">
                {nextRace.date}
              </Badge>
            </CardContent>
          </Card>
        )}
      </header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ButtonGroup
          selectedKeys={[tab]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            if (selected === 'tracks' || selected === 'grid' || selected === 'positions' || selected === 'data') {
              setTab(selected);
            }
          }}
        >
          <ButtonGroupItem id="tracks" iconLeading={Flag04}>
            {t('f1.tracks')}
          </ButtonGroupItem>
          <ButtonGroupItem id="grid" iconLeading={Users01}>
            {t('f1.grid')}
          </ButtonGroupItem>
          <ButtonGroupItem id="positions" iconLeading={Trophy01}>
            {t('f1.positions')}
          </ButtonGroupItem>
          <ButtonGroupItem id="data" iconLeading={Speedometer02}>
            {t('f1.dataSources')}
          </ButtonGroupItem>
        </ButtonGroup>
      </motion.div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {tab === 'tracks' && <TracksTab />}
        {tab === 'grid' && <GridTab />}
        {tab === 'positions' && <PositionsTab />}
        {tab === 'data' && <DataTab />}
      </motion.div>
    </div>
  );
}
