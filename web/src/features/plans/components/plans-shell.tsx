import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Star01 } from '@untitledui/icons';
import { NavIcon } from '@/components/shared/animated-icon';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { ContentLoader } from '@/components/shared/skeleton';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

const activityNavItems = [
  { to: '/plans', key: 'plans.nav.overview', icon: 'plans' as const, end: true },
  { to: '/plans/watching', key: 'plans.nav.watching', icon: 'plans' as const, end: false },
  { to: '/plans/racing', key: 'plans.nav.racing', icon: 'f1' as const },
  { to: '/plans/cooking', key: 'plans.nav.cooking', icon: 'food' as const },
  { to: '/plans/parties', key: 'plans.nav.parties', icon: 'parties' as const },
  { to: '/plans/board-games', key: 'plans.nav.boardGames', icon: 'games' as const },
  { to: '/plans/party-games', key: 'plans.nav.partyGames', icon: 'games' as const },
] as const;

export function PlansShell() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:gap-8">
      <aside className="shrink-0 lg:w-56 lg:sticky lg:top-6 lg:self-start">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-4 flex flex-col gap-3 px-4 py-5"
        >
          <div className="flex min-w-0 items-start gap-3">
            <FeaturedIcon icon={Star01} color="brand" theme="gradient" size="lg" />
            <div className="min-w-0">
              <h1 className="truncate text-display-sm font-semibold text-primary">{t('plans.title')}</h1>
              <p className="mt-1 line-clamp-2 text-sm text-tertiary">{t('plans.subtitle')}</p>
            </div>
          </div>
        </motion.header>

        <nav className="flex flex-row gap-1 overflow-x-auto pb-1 scrollbar-hide lg:flex-col lg:overflow-visible lg:pb-0">
          {activityNavItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : true}
              className={({ isActive }) =>
                cx(
                  'relative shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium transition duration-200',
                  isActive
                    ? 'text-brand-solid'
                    : 'text-tertiary hover:bg-primary_hover hover:text-secondary_hover',
                )
              }
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="plans-nav-active"
                      className="absolute inset-0 rounded-xl bg-brand-solid/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">
                    <NavIcon name={item.icon} isActive={isActive} />
                  </span>
                  <span className="relative z-10">{t(item.key)}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <Suspense fallback={<ContentLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}
