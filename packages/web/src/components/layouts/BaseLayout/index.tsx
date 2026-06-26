import { PropsWithChildren } from 'react';
import { AmbientBackground } from '@/components/webgl/AmbientBackground';
import { BottomNav } from '@/components/layouts/BottomNav';
import { SideNav } from '@/components/layouts/SideNav';
import { ProfileDropdown } from '@/components/shared/profile-dropdown';
import { RolesEnum, useUserStore } from '@/store/useUserStore';

export function BaseLayout({ children }: PropsWithChildren) {
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roles.includes(RolesEnum.Admin) ?? false;

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SideNav />

      <div className="flex min-h-screen flex-col md:pl-[4.5rem] xl:pl-60">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-secondary/60 bg-primary/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">HomeKit</p>
          </div>
          <ProfileDropdown showAdminBadge={isAdmin} />
        </header>

        <div className="flex-1 pb-20 md:pb-6 2xl:text-lg">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
}
