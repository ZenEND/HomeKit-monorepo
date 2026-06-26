import { useRef } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from 'react-aria-components';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ThemeSwitcher } from '@/components/shared/theme-switcher';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useUserStore } from '@/store/useUserStore';
import { cx } from '@/utils/cx';

const funnyAvatars = ['🐱', '🐶', '🦊', '🐸', '🐼', '🦄', '🤖', '👽'];

const getInitials = (email?: string) => {
  if (!email) return undefined;

  return email.slice(0, 1).toUpperCase();
};

interface ProfileDropdownProps {
  showAdminBadge?: boolean;
}

export function ProfileDropdown({ showAdminBadge = false }: ProfileDropdownProps) {
  const { t } = useTranslation();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore((state) => state.user);
  const avatarSrc = useUserStore((state) => state.avatarSrc);
  const avatarEmoji = useUserStore((state) => state.avatarEmoji);
  const setProfilePhoto = useUserStore((state) => state.setProfilePhoto);
  const setProfileAvatar = useUserStore((state) => state.setProfileAvatar);
  const logout = useUserStore((state) => state.logout);

  const handleFile = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AriaDialogTrigger>
      <Button
        color="tertiary"
        className="relative rounded-full p-1!"
        aria-label={t('profile.menu')}
      >
        {showAdminBadge && (
          <span className="absolute -right-0.5 -top-0.5 z-10 size-2.5 rounded-full bg-brand-solid ring-2 ring-primary" />
        )}
        <Avatar
          size="sm"
          src={avatarSrc}
          alt={user?.email ?? t('profile.menu')}
          initials={avatarEmoji ? undefined : getInitials(user?.email)}
          placeholder={avatarEmoji ? <span className="text-lg">{avatarEmoji}</span> : undefined}
          border
          focusable
        />
      </Button>

      <AriaPopover
        placement="bottom end"
        offset={8}
        className={({ isEntering, isExiting }) =>
          cx(
            'z-50 w-80 rounded-xl border border-secondary bg-primary p-4 shadow-lg outline-hidden',
            isEntering && 'duration-150 ease-out animate-in fade-in slide-in-from-top-1',
            isExiting && 'duration-100 ease-in animate-out fade-out slide-out-to-top-1',
          )
        }
      >
        <AriaDialog className="outline-hidden">
          <div className="flex items-center gap-3 border-b border-secondary pb-4">
            <Avatar
              size="lg"
              src={avatarSrc}
              alt={user?.email ?? t('profile.menu')}
              initials={avatarEmoji ? undefined : getInitials(user?.email)}
              placeholder={avatarEmoji ? <span className="text-2xl">{avatarEmoji}</span> : undefined}
              border
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">{t('profile.settings')}</p>
              <p className="truncate text-sm text-tertiary">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-5 py-4">
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">
                {t('profile.avatar')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button color="secondary" size="sm" onPress={() => cameraInputRef.current?.click()}>
                  {t('profile.takePhoto')}
                </Button>
                <Button color="secondary" size="sm" onPress={() => uploadInputRef.current?.click()}>
                  {t('profile.uploadPicture')}
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(event) => {
                  handleFile(event.currentTarget.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handleFile(event.currentTarget.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />

              <p className="mt-4 mb-2 text-xs font-medium text-tertiary">{t('profile.funnyAvatars')}</p>
              <div className="grid grid-cols-8 gap-1.5">
                {funnyAvatars.map((avatar) => (
                  <Button
                    key={avatar}
                    color={avatarEmoji === avatar ? 'secondary' : 'tertiary'}
                    size="sm"
                    className="aspect-square p-0!"
                    aria-label={t('profile.selectAvatar')}
                    onPress={() => setProfileAvatar(avatar)}
                  >
                    <span className="text-lg">{avatar}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">
                {t('theme.label')}
              </p>
              <ThemeSwitcher />
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-quaternary">
                {t('language.label')}
              </p>
              <LanguageSwitcher />
            </section>
          </div>

          <div className="border-t border-secondary pt-4">
            <Button color="secondary-destructive" size="sm" className="w-full" onPress={logout}>
              {t('auth.logout')}
            </Button>
          </div>
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
}
