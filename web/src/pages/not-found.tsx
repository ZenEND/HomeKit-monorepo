import { ArrowLeft } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="flex max-w-md flex-col items-center text-center">
        <FeaturedIcon
          icon={ArrowLeft}
          color="gray"
          theme="modern"
          size="xl"
        />

        <h1 className="mt-6 text-display-sm font-semibold text-primary">{t('notFound.title')}</h1>
        <p className="mt-3 text-md text-tertiary">{t('notFound.description')}</p>

        <Button href="/" color="primary" size="md" className="mt-8" iconLeading={ArrowLeft}>
          {t('notFound.back')}
        </Button>
      </div>
    </div>
  );
}
