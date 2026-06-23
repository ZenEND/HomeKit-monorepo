import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RouteProvider } from '@/providers/route-provider';
import { BaseLayout } from './components/layouts/BaseLayout';
import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export function App() {
  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <RouteProvider>
      <Outlet />
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
        <main className="mx-auto w-full max-w-6xl px-2 py-2 sm:px-4 sm:py-4">
          <div className="rounded-2xl border border-secondary bg-primary p-6 text-sm text-tertiary">
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
      <main className="mx-auto w-full max-w-6xl px-2 py-2 sm:px-4 sm:py-4">
        <Outlet />
      </main>
    </BaseLayout>
  );
}
