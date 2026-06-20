import { useTranslation } from '@/lib/i18n/use-translation';

export function About() {
  const { t } = useTranslation();

  return (
    <section>
      <h2>{t('about.title')}</h2>
      <p>{t('about.description')}</p>
    </section>
  );
}
