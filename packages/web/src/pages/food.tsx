import { ShoppingCart01 } from '@untitledui/icons';
import { ComingSoon } from '@/components/shared/coming-soon';
import { useTranslation } from '@/lib/i18n/use-translation';

export function Food() {
  const { t } = useTranslation();

  return (
    <ComingSoon
      icon={ShoppingCart01}
      title={t('food.title')}
      description={t('food.description')}
      targetDate="Nov 2026"
      features={[
        t('food.feature1'),
        t('food.feature2'),
        t('food.feature3'),
        t('food.feature4'),
      ]}
    />
  );
}
