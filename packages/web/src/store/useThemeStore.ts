import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === 'system' ? getSystemTheme() : theme;

const applyTheme = (resolved: ResolvedTheme) => {
  document.documentElement.classList.toggle('dark-mode', resolved === 'dark');
};

let mediaQueryListener: (() => void) | null = null;

const bindSystemListener = (set: (partial: Partial<ThemeState>) => void) => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const resolved = getSystemTheme();
    applyTheme(resolved);
    set({ resolvedTheme: resolved });
  };
  mq.addEventListener('change', handler);
  mediaQueryListener = () => mq.removeEventListener('change', handler);
};

const unbindSystemListener = () => {
  mediaQueryListener?.();
  mediaQueryListener = null;
};

type ThemeState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: (theme) => {
        unbindSystemListener();
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
        if (theme === 'system') {
          bindSystemListener(set);
        }
      },
    }),
    {
      name: 'homekit-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const resolved = resolveTheme(state.theme);
        applyTheme(resolved);
        state.resolvedTheme = resolved;
        if (state.theme === 'system') {
          bindSystemListener((partial) => useThemeStore.setState(partial));
        }
      },
    },
  ),
);
