import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RouteProvider } from '@/providers/route-provider';
import { BaseLayout } from './components/layouts/BaseLayout';
import { ErrorTooltips } from '@/components/feedback/error-tooltips';
import { PageTransition } from '@/components/shared/page-transition';
import { ContentLoader } from '@/components/shared/skeleton';
import { LoadingSpinner } from '@/components/shared/animated-icon';
import { useEffect } from 'react';
import { RolesEnum, useUserStore } from '@/store/useUserStore';

export function App() {
  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <RouteProvider>
      <ErrorTooltips />
      <Suspense fallback={<ContentLoader />}>
        <Outlet />
      </Suspense>
    </RouteProvider>
  );
}

export function ProtectedAppLayout() {
  const location = useLocation();
  const isInitialized = useUserStore((state) => state.isInitialized);
  const token = useUserStore((state) => state.token);

  if (!isInitialized) {
    return (
      <BaseLayout>
        <main className="mx-auto flex w-full max-w-screen-2xl items-center justify-center px-4 py-16">
          <div className="glass-card flex items-center gap-3 p-6 text-sm text-tertiary">
            <LoadingSpinner className="text-brand-secondary" />
            Loading...
          </div>
        </main>
      </BaseLayout>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <BaseLayout>
      <main className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-6 sm:py-6">
        <PageTransition variant="slide" />
      </main>
    </BaseLayout>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const isInitialized = useUserStore((state) => state.isInitialized);
  const token = useUserStore((state) => state.token);
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roles.includes(RolesEnum.Admin) ?? false;

  if (!isInitialized) {
    return (
      <BaseLayout>
        <main className="mx-auto flex w-full max-w-screen-2xl items-center justify-center px-4 py-16">
          <LoadingSpinner className="text-brand-secondary" />
        </main>
      </BaseLayout>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/plans" replace />;
  }

  return (
    <BaseLayout>
      <main className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-6 sm:py-6">
        <PageTransition variant="slide" />
      </main>
    </BaseLayout>
  );
}
