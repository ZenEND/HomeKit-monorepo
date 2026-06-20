import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/base/buttons/button';
import { useTranslation } from '@/lib/i18n/use-translation';
import { Group as AriaGroup } from 'react-aria-components';

export function Home() {
  const { t } = useTranslation();
  const { count, health, loading, error, increment, decrement, fetchHealth } =
    useAppStore();

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  return (
    <section>
      <h2>{t('home.title')}</h2>
      <p>{t('home.subtitle')}</p>

      <div>
        <p>
          {t('home.counter')}: {count}
        </p>
        <AriaGroup className="flex flex-row gap-2">
          <Button type="button" onClick={decrement}>
            -
          </Button>
          <Button type="button" onClick={increment}>
            +
          </Button>
        </AriaGroup>
      </div>

      <div>
        <h3>{t('home.apiHealth')}</h3>
        <button type="button" onClick={() => void fetchHealth()} disabled={loading}>
          {loading ? t('home.loading') : t('home.refresh')}
        </button>
        {error && <p role="alert">{error}</p>}
        {health && (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        )}
      </div>
    </section>
  );
}
