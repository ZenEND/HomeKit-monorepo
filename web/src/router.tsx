import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App, ProtectedAppLayout } from './App';
import { About } from './pages/About';
import { LandingLayout } from './components/layouts/LandingLayout';
import { Development } from './pages/Development';
import { ComponentsExample } from './pages/Development/components-example';
import { F1 } from './pages/f1';
import { Food } from './pages/food';
import { Games } from './pages/games';
import { Home } from './pages/Home';
import { Invite } from './pages/invite';
import { Login } from './pages/login';
import { NotFound } from './pages/not-found';
import { Parties } from './pages/parties';
import { Plans } from './pages/plans';
import { Roadmap } from './pages/Development/roadmap';
import { Storage } from './pages/storage';
import { Worktree } from './pages/Development/worktree';
import { AliasGame } from './pages/AliasGame';

export const router = createBrowserRouter([
  {
    path: '/alias',
    element: <AliasGame />,
  },
  {
    path: '/',
    element: <App />,
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
            element: <Plans />,
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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
