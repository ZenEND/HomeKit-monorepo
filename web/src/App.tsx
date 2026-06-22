import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RouteProvider } from '@/providers/route-provider';
import { BaseLayout } from './components/layouts/BaseLayout';

export function App() {
  return (
    <RouteProvider>
      <Outlet />
    </RouteProvider>
  );
}

export function ProtectedAppLayout() {
  const location = useLocation();
  const isAuthenticated = Boolean(window.localStorage.getItem('homekit.authToken'));

  if (!isAuthenticated) {
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
