import { useMemo, useState } from 'react';
import { Calendar, MarkerPin02, Users01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { Badge } from '@/components/base/badges/badges';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Card, CardContent } from '@/components/base/card/card';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  categoryColors,
  getCategoryLabel,
  groupEventsByCity,
  localizeEvent,
  localizeReleaseSource,
  plannedEvents,
  releaseSources,
  type EventCategory,
  type PlannedEvent,
  type ReleaseSource,
} from '@/lib/plans/events-data';

type ViewMode = 'location' | 'timeline';

function sourceTypeKey(type: ReleaseSource['type']): string {
  switch (type) {
    case 'calendar':
      return 'plans.calendar';
    case 'database':
      return 'plans.database';
    case 'tracker':
      return 'plans.tracker';
    case 'news':
      return 'plans.news';
  }
}

function EventCard({ event }: { event: PlannedEvent }) {
  const { t, language } = useTranslation();
  const localized = localizeEvent(event, language);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <span className="text-xl" aria-hidden="true">
              {event.emoji}
            </span>
            <div>
              <p className="text-sm font-medium text-primary">{localized.title}</p>
              <p className="text-xs text-tertiary">
                {t('plans.hostedBy')} {localized.host}
              </p>
            </div>
          </div>
          <Badge color={categoryColors[event.category]} size="sm">
            {getCategoryLabel(event.category, language)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" aria-hidden="true" />
            {event.date} · {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MarkerPin02 className="size-3.5" aria-hidden="true" />
            {localized.locationName}
          </span>
          <span className="flex items-center gap-1">
            <Users01 className="size-3.5" aria-hidden="true" />
            {t('plans.goingMaybe', { going: event.going, maybe: event.maybe })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Plans() {
  const { t, language } = useTranslation();
  const [view, setView] = useState<ViewMode>('location');
  const [category, setCategory] = useState<'all' | EventCategory>('all');

  const filtered = useMemo(() => {
    if (category === 'all') return plannedEvents;
    return plannedEvents.filter((e) => e.category === category);
  }, [category]);

  const grouped = useMemo(() => groupEventsByCity(filtered), [filtered]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <FeaturedIcon icon={MarkerPin02} color="brand" theme="gradient" size="lg" />
        <div>
          <h1 className="text-display-sm font-semibold text-primary">{t('plans.title')}</h1>
          <p className="mt-2 max-w-2xl text-md text-tertiary">{t('plans.subtitle')}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-secondary">{t('plans.view')}</p>
          <ButtonGroup
            selectedKeys={[view]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              if (selected === 'location' || selected === 'timeline') setView(selected);
            }}
          >
            <ButtonGroupItem id="location" iconLeading={MarkerPin02}>
              {t('plans.byLocation')}
            </ButtonGroupItem>
            <ButtonGroupItem id="timeline" iconLeading={Calendar}>
              {t('plans.timeline')}
            </ButtonGroupItem>
          </ButtonGroup>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-secondary">{t('plans.category')}</p>
          <ButtonGroup
            selectedKeys={[category]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0];
              if (
                selected === 'all' ||
                selected === 'game-night' ||
                selected === 'dinner' ||
                selected === 'outdoor' ||
                selected === 'watch-party' ||
                selected === 'trip'
              ) {
                setCategory(selected);
              }
            }}
          >
            <ButtonGroupItem id="all">{t('common.all')}</ButtonGroupItem>
            <ButtonGroupItem id="game-night">{t('plans.games')}</ButtonGroupItem>
            <ButtonGroupItem id="dinner">{t('plans.dinner')}</ButtonGroupItem>
            <ButtonGroupItem id="outdoor">{t('plans.outdoor')}</ButtonGroupItem>
            <ButtonGroupItem id="watch-party">{t('plans.watch')}</ButtonGroupItem>
          </ButtonGroup>
        </div>
      </div>

      {view === 'location' ? (
        <div className="flex flex-col gap-8">
          {grouped.map((group, gi) => (
            <motion.section
              key={group.city}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: gi * 0.05 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {group.flag}
                </span>
                <h2 className="text-lg font-semibold text-primary">{group.city}</h2>
                <Badge color="gray" size="sm">
                  {group.events.length} {group.events.length === 1 ? t('plans.event') : t('plans.events')}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </motion.section>
          ))}
          {grouped.length === 0 && (
            <p className="py-8 text-center text-md text-tertiary">{t('plans.noEvents')}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-md text-tertiary">{t('plans.noEvents')}</p>
          )}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">{t('plans.sourcesTitle')}</h2>
          <p className="mt-1 text-sm text-tertiary">{t('plans.sourcesSubtitle')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {releaseSources.map((source) => {
            const localized = localizeReleaseSource(source, language);
            return (
              <Card key={source.id}>
                <CardContent className="flex flex-col gap-2 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary">{localized.name}</p>
                    <Badge color="brand" size="sm">
                      {t(sourceTypeKey(source.type))}
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary">
                    <span className="font-medium">{t('plans.bestFor')}:</span> {localized.bestFor}
                  </p>
                  <p className="text-xs text-tertiary">{localized.notes}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-brand-secondary"
                  >
                    {source.url}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
