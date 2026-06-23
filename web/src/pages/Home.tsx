import { Button } from '@/components/base/buttons/button';
import { useTranslation } from '@/lib/i18n/use-translation';

function openAuthPage(path: '/login' | '/sign-up') {
  window.location.assign(path);
}

export function Home() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-secondary">
          {t('home.eyebrow')}
        </p>
        <h1 className="max-w-3xl text-display-md font-semibold tracking-tight text-primary sm:text-display-lg">
          {t('home.title')}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-tertiary">{t('home.subtitle')}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="xl" className="w-full sm:w-auto text-white!" onPress={() => openAuthPage('/login')}>
            {t('home.login')}
          </Button>
          <Button color="secondary" size="xl" className="w-full sm:w-auto" onPress={() => openAuthPage('/sign-up')}>
            {t('home.signUp')}
          </Button>
          <Button href="/invite" color="tertiary" size="xl" className="w-full sm:w-auto">
            {t('home.scanQr')}
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-secondary bg-primary p-6 shadow-lg">
        <div className="rounded-2xl bg-secondary p-5">
          <p className="text-sm font-medium text-tertiary">{t('home.cardLabel')}</p>
          <h2 className="mt-3 text-display-xs font-semibold text-primary">{t('home.cardTitle')}</h2>
          <p className="mt-3 text-md text-tertiary">{t('home.cardDescription')}</p>
        </div>
      </div>
    </section>
  );
}
