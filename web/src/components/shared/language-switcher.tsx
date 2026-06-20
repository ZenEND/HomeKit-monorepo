import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { supportedLanguages, type Language } from '@/lib/i18n/i18n-store';
import { useTranslation } from '@/lib/i18n/use-translation';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <ButtonGroup
      size="sm"
      selectedKeys={[language]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0];
        if (selected === 'en' || selected === 'ua') {
          setLanguage(selected as Language);
        }
      }}
    >
      {supportedLanguages.map((lang) => (
        <ButtonGroupItem key={lang.id} id={lang.id}>
          {lang.flag} {lang.id.toUpperCase()}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
}
