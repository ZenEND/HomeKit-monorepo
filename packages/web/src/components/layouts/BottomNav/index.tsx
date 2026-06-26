import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { NavIcon } from '@/components/shared/animated-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

const bottomNavItems = [
  { to: '/plans', key: 'nav.plans', icon: 'plans' as const, end: false },
  { to: '/games', key: 'nav.games', icon: 'games' as const },
  { to: '/f1', key: 'nav.f1', icon: 'f1' as const },
  { to: '/food', key: 'nav.food', icon: 'food' as const },
  { to: '/storage', key: 'nav.storage', icon: 'storage' as const },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const activeIndex = bottomNavItems.findIndex((item) =>
    item.end === false ? location.pathname.startsWith(item.to) : location.pathname === item.to,
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-secondary/60 bg-primary/85 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label={t('nav.main')}
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {activeIndex >= 0 && (
          <motion.div
            layoutId="bottom-nav-pill"
            className="absolute top-2 h-12 w-[calc(20%-8px)] rounded-2xl bg-brand-primary/80"
            style={{ left: `calc(${activeIndex * 20}% + 4px)` }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}

        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                'relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors',
                isActive ? 'text-brand-secondary' : 'text-tertiary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon name={item.icon} isActive={isActive} />
                <span className="truncate text-[10px] font-medium">{t(item.key)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
