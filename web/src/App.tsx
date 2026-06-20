import { NavLink, Outlet } from 'react-router-dom';
import { Home02 } from '@untitledui/icons';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { RouteProvider } from '@/providers/route-provider';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

const navItems = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/storage', key: 'nav.storage' },
  { to: '/games', key: 'nav.games' },
  { to: '/f1', key: 'nav.f1' },
  { to: '/parties', key: 'nav.parties' },
  { to: '/plans', key: 'nav.plans' },
  { to: '/food', key: 'nav.food' },
  { to: '/invite', key: 'nav.invite' },
  { to: '/roadmap', key: 'nav.roadmap' },
  { to: '/worktree', key: 'nav.worktree' },
  { to: '/components', key: 'nav.components' },
  { to: '/login', key: 'nav.login' },
];

export function App() {
  const { t } = useTranslation();

  return (
    <RouteProvider>
      <div className="min-h-screen bg-secondary">
        <header className="sticky top-0 z-20 border-b border-secondary bg-primary/90 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/" className="flex items-center gap-2.5">
                <FeaturedIcon icon={Home02} color="brand" theme="gradient" size="sm" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-primary">{t('app.title')}</p>
                  <p className="hidden text-xs text-tertiary sm:block">{t('app.tagline')}</p>
                </div>
              </NavLink>
              <LanguageSwitcher />
            </div>

            <nav className="-mx-1 flex items-center gap-1 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx(
                      'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition duration-100 ease-linear',
                      isActive
                        ? 'bg-active text-brand-secondary'
                        : 'text-tertiary hover:bg-primary_hover hover:text-secondary_hover',
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-2 py-2 sm:px-4 sm:py-4">
          <Outlet />
        </main>
      </div>
    </RouteProvider>
  );
}
