import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

const developmentNavItems = [
  { to: '/development/roadmap', key: 'nav.roadmap' },
  { to: '/development/worktree', key: 'nav.worktree' },
  { to: '/development/components', key: 'nav.components' },
];

export function Development() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary px-4 py-5 shadow-xs sm:px-6">
        <div>
          <p className="text-sm font-medium text-brand-secondary">{t('nav.development')}</p>
          <h1 className="mt-1 text-display-xs font-semibold text-primary">{t('development.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-tertiary">{t('development.subtitle')}</p>
        </div>

        <nav className="-mx-1 flex items-center gap-1 overflow-x-auto pb-1">
          {developmentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
      </header>

      <Outlet />
    </div>
  );
}