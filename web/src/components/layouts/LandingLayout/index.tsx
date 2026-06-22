import type { PropsWithChildren } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home02 } from '@untitledui/icons';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { useTranslation } from '@/lib/i18n/use-translation';

export function LandingLayout({ children }: PropsWithChildren) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-hidden bg-secondary">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5">
        <NavLink to="/" className="flex items-center gap-2.5">
          <FeaturedIcon icon={Home02} color="brand" theme="gradient" size="sm" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-primary">{t('app.title')}</p>
            <p className="hidden text-xs text-tertiary sm:block">{t('app.tagline')}</p>
          </div>
        </NavLink>
        <LanguageSwitcher />
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] w-full max-w-6xl items-center px-4 py-10">
        <div className="pointer-events-none absolute inset-x-4 top-8 h-72 rounded-full bg-brand-solid/10 blur-3xl" />
        <div className="relative w-full">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}
