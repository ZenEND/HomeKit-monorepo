import { useCallback } from 'react';
import { useI18nStore, type Language } from './i18n-store';
import { translate, type TranslationValues } from './translations';

export function useTranslation() {
  const language = useI18nStore((state) => state.language);
  const setLanguage = useI18nStore((state) => state.setLanguage);

  const t = useCallback(
    (key: string, values?: TranslationValues) => translate(language, key, values),
    [language],
  );

  return { t, language: language as Language, setLanguage };
}
