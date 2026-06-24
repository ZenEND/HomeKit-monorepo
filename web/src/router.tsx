import { lazy } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { App, AdminLayout, ProtectedAppLayout } from './App';
import { RouteChunkError } from '@/components/feedback/chunk-error-boundary';

const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Development = lazy(() =>
  import('./pages/Development').then((m) => ({ default: m.Development })),
);
const ComponentsExample = lazy(() =>
  import('./pages/Development/components-example').then((m) => ({ default: m.ComponentsExample })),
);
const F1 = lazy(() => import('./pages/f1').then((m) => ({ default: m.F1 })));
const Food = lazy(() => import('./pages/food').then((m) => ({ default: m.Food })));
const Games = lazy(() => import('./pages/games').then((m) => ({ default: m.Games })));
const Invite = lazy(() => import('./pages/invite').then((m) => ({ default: m.Invite })));
const Login = lazy(() => import('./pages/login').then((m) => ({ default: m.Login })));
const NotFound = lazy(() => import('./pages/not-found').then((m) => ({ default: m.NotFound })));
const Parties = lazy(() => import('./pages/parties').then((m) => ({ default: m.Parties })));
const Storage = lazy(() => import('./pages/storage').then((m) => ({ default: m.Storage })));
const Roadmap = lazy(() =>
  import('./pages/Development/roadmap').then((m) => ({ default: m.Roadmap })),
);
const Worktree = lazy(() =>
  import('./pages/Development/worktree').then((m) => ({ default: m.Worktree })),
);
const AliasGame = lazy(() =>
  import('./pages/AliasGame').then((m) => ({ default: m.AliasGame })),
);
const AdminPage = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminPage })));

const PlansShell = lazy(() =>
  import('./pages/plans').then((m) => ({ default: m.PlansShell })),
);
const WatchingShell = lazy(() =>
  import('./pages/plans').then((m) => ({ default: m.WatchingShell })),
);
const CurrentReleases = lazy(() =>
  import('./pages/plans/current-releases').then((m) => ({ default: m.CurrentReleases })),
);
const UpcomingReleases = lazy(() =>
  import('./pages/plans/upcoming-releases').then((m) => ({ default: m.UpcomingReleases })),
);
const SavedWatchingPage = lazy(() =>
  import('./pages/plans/saved-watching').then((m) => ({ default: m.SavedWatchingPage })),
);
const RacingPage = lazy(() =>
  import('./pages/plans/racing').then((m) => ({ default: m.RacingPage })),
);
const CookingPage = lazy(() =>
  import('./pages/plans/cooking').then((m) => ({ default: m.CookingPage })),
);
const PartiesPage = lazy(() =>
  import('./pages/plans/parties').then((m) => ({ default: m.PartiesPage })),
);
const BoardGamesPage = lazy(() =>
  import('./pages/plans/board-games').then((m) => ({ default: m.BoardGamesPage })),
);
const PartyGamesPage = lazy(() =>
  import('./pages/plans/party-games').then((m) => ({ default: m.PartyGamesPage })),
);
const PlansIndexPage = lazy(() =>
  import('./pages/plans').then((m) => ({ default: m.PlansIndexPage })),
);

const TitleDetailPage = lazy(() =>
  import('./pages/plans/title-detail').then((m) => ({ default: m.TitleDetailPage })),
);

import { LandingLayout } from './components/layouts/LandingLayout';

function RouteErrorElement() {
  const error = useRouteError();
  return <RouteChunkError error={error} />;
}

export const router = createBrowserRouter([
  {
    path: '/alias',
    element: <AliasGame />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        element: <LandingLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
        ],
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'sign-up',
        element: <Login />,
      },
      {
        element: <ProtectedAppLayout />,
        children: [
          {
            path: 'about',
            element: <About />,
          },
          {
            path: 'development',
            element: <Development />,
            children: [
              {
                index: true,
                element: <Navigate to="roadmap" replace />,
              },
              {
                path: 'components',
                element: <ComponentsExample />,
              },
              {
                path: 'roadmap',
                element: <Roadmap />,
              },
              {
                path: 'worktree',
                element: <Worktree />,
              },
            ],
          },
          {
            path: 'storage',
            element: <Storage />,
          },
          {
            path: 'games',
            element: <Games />,
          },
          {
            path: 'f1',
            element: <F1 />,
          },
          {
            path: 'parties',
            element: <Parties />,
          },
          {
            path: 'plans',
            element: <PlansShell />,
            children: [
              {
                index: true,
                element: <PlansIndexPage />,
              },
              {
                path: 'watching',
                element: <WatchingShell />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="current" replace />,
                  },
                  {
                    path: 'current',
                    element: <CurrentReleases />,
                  },
                  {
                    path: 'upcoming',
                    element: <UpcomingReleases />,
                  },
                  {
                    path: 'saved',
                    element: <SavedWatchingPage />,
                  },
                  {
                    path: 'title/:id',
                    element: <TitleDetailPage />,
                  },
                ],
              },
              {
                path: 'racing',
                element: <RacingPage />,
              },
              {
                path: 'cooking',
                element: <CookingPage />,
              },
              {
                path: 'parties',
                element: <PartiesPage />,
              },
              {
                path: 'board-games',
                element: <BoardGamesPage />,
              },
              {
                path: 'party-games',
                element: <PartyGamesPage />,
              },
            ],
          },
          {
            path: 'food',
            element: <Food />,
          },
          {
            path: 'invite',
            element: <Invite />,
          },
          {
            path: 'roadmap',
            element: <Roadmap />,
          },
          {
            path: 'worktree',
            element: <Worktree />,
          },
        ],
      },
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'admin',
            element: <AdminPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
