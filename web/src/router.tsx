import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { About } from './pages/About';
import { ComponentsExample } from './pages/components-example';
import { F1 } from './pages/f1';
import { Food } from './pages/food';
import { Games } from './pages/games';
import { Home } from './pages/Home';
import { Invite } from './pages/invite';
import { Login } from './pages/login';
import { NotFound } from './pages/not-found';
import { Parties } from './pages/parties';
import { Plans } from './pages/plans';
import { Roadmap } from './pages/roadmap';
import { Storage } from './pages/storage';
import { Worktree } from './pages/worktree';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'components',
        element: <ComponentsExample />,
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
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
