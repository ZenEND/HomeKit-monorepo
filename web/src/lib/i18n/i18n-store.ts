import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ua';

export const supportedLanguages: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'ua', label: 'Українська', flag: '🇺🇦' },
];

type I18nState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'homekit-language' },
  ),
);
