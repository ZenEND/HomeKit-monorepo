import { QrCode01 } from '@untitledui/icons';
import { ComingSoon } from '@/components/shared/coming-soon';
import { useTranslation } from '@/lib/i18n/use-translation';

export function Invite() {
  const { t } = useTranslation();

  return (
    <ComingSoon
      icon={QrCode01}
      title={t('invite.title')}
      description={t('invite.description')}
      targetDate="Aug 2026"
      features={[
        t('invite.feature1'),
        t('invite.feature2'),
        t('invite.feature3'),
        t('invite.feature4'),
      ]}
    />
  );
}
