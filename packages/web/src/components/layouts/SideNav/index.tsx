import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedLogo, NavIcon } from '@/components/shared/animated-icon';
import { ProfileDropdown } from '@/components/shared/profile-dropdown';
import { useTranslation } from '@/lib/i18n/use-translation';
import { RolesEnum, useUserStore } from '@/store/useUserStore';
import { cx } from '@/utils/cx';

const mainNavItems = [
  { to: '/plans', key: 'nav.plans', icon: 'plans' as const, end: false },
  { to: '/games', key: 'nav.games', icon: 'games' as const },
  { to: '/f1', key: 'nav.f1', icon: 'f1' as const },
  { to: '/parties', key: 'nav.parties', icon: 'parties' as const },
  { to: '/food', key: 'nav.food', icon: 'food' as const },
  { to: '/storage', key: 'nav.storage', icon: 'storage' as const },
  { to: '/invite', key: 'nav.invite', icon: 'invite' as const },
  { to: '/development', key: 'nav.development', icon: 'development' as const, end: false },
];

const adminSubItems = [
  { to: '/admin', label: 'Dashboard', icon: '⚙', end: true },
  { to: '/admin/games', label: 'Games', icon: '🕹', end: false },
  { to: '/admin/cards', label: 'Cards', icon: '🃏', end: false },
  { to: '/admin/door-events', label: 'Door Events', icon: '🚪', end: true },
  { to: '/admin/carry-effects', label: 'Carry Effects', icon: '✨', end: true },
  { to: '/admin/games/approvals', label: 'GM Approvals', icon: '🎲', end: true },
  { to: '/admin/monitor', label: 'Monitor', icon: '📡', end: true },
];

function AdminSubNav() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-secondary/40 pl-2">
        {adminSubItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-150 opacity-0 group-hover/sidenav:opacity-100',
                isActive
                  ? 'bg-brand-primary/20 text-brand-secondary'
                  : 'text-tertiary hover:bg-primary_hover hover:text-secondary',
              )
            }
          >
            <span className="shrink-0 text-sm leading-none">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </motion.div>
  );
}

export function SideNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roles.includes(RolesEnum.Admin) ?? false;
  const displayName = user?.email ?? t('profile.menu');

  const isAdminSection = pathname.startsWith('/admin');

  return (
    <aside className="group/sidenav fixed inset-y-0 left-0 z-20 hidden w-[4.5rem] flex-col border-r border-secondary/60 bg-primary/80 backdrop-blur-xl transition-all duration-300 hover:w-60 md:flex">
      <div className="min-w-0 border-b border-secondary/60 px-4 py-4">
        <NavLink to="/" className="flex min-w-0 items-center gap-3 overflow-hidden">
          <AnimatedLogo size={36} />
          <div className="min-w-0 overflow-hidden opacity-0 transition-opacity duration-200 group-hover/sidenav:opacity-100">
            <p className="truncate text-sm font-semibold text-primary">{t('app.title')}</p>
            <p className="truncate text-xs text-tertiary">{t('app.tagline')}</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2" aria-label={t('nav.main')}>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : true}
            className={({ isActive }) =>
              cx(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-primary text-brand-secondary shadow-sm'
                  : 'text-tertiary hover:bg-primary_hover hover:text-secondary',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="side-nav-active"
                    className="absolute inset-0 rounded-xl bg-brand-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10 shrink-0">
                  <NavIcon name={item.icon} isActive={isActive} />
                </span>
                <span className="relative z-10 truncate opacity-0 transition-opacity duration-150 group-hover/sidenav:opacity-100">
                  {t(item.key)}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <div>
            <NavLink
              to="/admin"
              end={false}
              className={({ isActive }) =>
                cx(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-primary text-brand-secondary shadow-sm'
                    : 'text-tertiary hover:bg-primary_hover hover:text-secondary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !isAdminSection && (
                    <motion.div
                      layoutId="side-nav-active"
                      className="absolute inset-0 rounded-xl bg-brand-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 shrink-0">
                    <NavIcon name="admin" isActive={isActive} />
                  </span>
                  <span className="relative z-10 truncate opacity-0 transition-opacity duration-150 group-hover/sidenav:opacity-100">
                    {t('nav.admin')}
                  </span>
                </>
              )}
            </NavLink>

            <AnimatePresence>
              {isAdminSection && <AdminSubNav />}
            </AnimatePresence>
          </div>
        )}
      </nav>

      <div className="min-w-0 border-t border-secondary/60 p-3">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-xl p-1 hover:bg-primary_hover">
          <ProfileDropdown showAdminBadge={isAdmin} />
          <div className="min-w-0 overflow-hidden opacity-0 transition-opacity duration-200 group-hover/sidenav:opacity-100">
            <p className="truncate text-sm font-medium text-primary">{displayName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
