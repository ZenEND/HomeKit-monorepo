import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { type Theme, useThemeStore } from '@/store/useThemeStore';
import { useTranslation } from '@/lib/i18n/use-translation';

const themes: { id: Theme; icon: string; labelKey: string }[] = [
  { id: 'light', icon: '☀️', labelKey: 'theme.light' },
  { id: 'dark', icon: '🌙', labelKey: 'theme.dark' },
  { id: 'system', icon: '🖥️', labelKey: 'theme.system' },
];

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <ButtonGroup
      size="sm"
      selectedKeys={[theme]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as Theme;
        if (selected === 'light' || selected === 'dark' || selected === 'system') {
          setTheme(selected);
        }
      }}
    >
      {themes.map((item) => (
        <ButtonGroupItem key={item.id} id={item.id}>
          {item.icon} {t(item.labelKey)}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
}
