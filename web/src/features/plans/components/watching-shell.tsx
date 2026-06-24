import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ContentLoader } from '@/components/shared/skeleton';
import { WatchingParticlesCanvas } from '@/components/webgl/WatchingParticlesCanvas';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

type WatchingTabKey = 'current' | 'upcoming' | 'saved';

interface WatchingShellProps {
  tabCounts?: Partial<Record<WatchingTabKey, number>>;
}

const watchingNavItems: Array<{
  to: string;
  key: 'plans.nav.currentSeason' | 'plans.nav.upcoming' | 'plans.nav.savedList';
  countKey: WatchingTabKey;
}> = [
  { to: '/plans/watching/current', key: 'plans.nav.currentSeason', countKey: 'current' },
  { to: '/plans/watching/upcoming', key: 'plans.nav.upcoming', countKey: 'upcoming' },
  { to: '/plans/watching/saved', key: 'plans.nav.savedList', countKey: 'saved' },
];

export function WatchingShell({ tabCounts }: WatchingShellProps = {}) {
  const { t } = useTranslation();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex flex-col gap-6">
      <WatchingParticlesCanvas />

      <nav className="-mx-1 flex items-center gap-1 overflow-x-auto border-b border-secondary/60 pb-3 scrollbar-hide">
        {watchingNavItems.map((item) => {
          const count = tabCounts?.[item.countKey];

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'relative shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200',
                  isActive
                    ? 'text-brand-secondary'
                    : 'text-tertiary hover:bg-primary_hover hover:text-secondary_hover',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="watching-tab-pill"
                        className="absolute inset-0 rounded-xl bg-brand-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                      <span
                        className={cx(
                          'tab-pulse-underline absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-secondary',
                          prefersReducedMotion && 'opacity-100',
                        )}
                        aria-hidden="true"
                      />
                    </>
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {t(item.key)}
                    {count !== undefined && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/80 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                        {count}
                      </span>
                    )}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <motion.div
        key={location.pathname}
        initial={prefersReducedMotion ? { opacity: 0 } : { x: 8 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </motion.div>
    </div>
  );
}
