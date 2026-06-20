# Web (React + Vite)

React frontend with TypeScript, Zustand, React Router, Sass, and PostCSS CSS modules.

## Stack

- **React 19** + **Vite 6**
- **TypeScript**
- **Zustand** — state management
- **React Router** — client-side routing
- **Sass** — global styles and CSS modules (`.module.scss`)

## Structure

```
web/src/
├── main.tsx              # Entry point
├── App.tsx               # Layout shell
├── App.module.scss       # CSS module example
├── router.tsx            # Route definitions
├── store/
│   └── useAppStore.ts    # Zustand store (counter + API health)
├── pages/
│   ├── Home.tsx
│   └── About.tsx
└── styles/
    └── global.scss       # Global Sass styles
```

## Local development

```bash
# From repo root
pnpm dev:web
```

Open [http://localhost:5173](http://localhost:5173).

The home page uses Zustand to manage a counter and fetches the API health endpoint at `VITE_API_URL`.

## Environment variables

| Variable       | Default                  | Description     |
|----------------|--------------------------|-----------------|
| `VITE_API_URL` | `http://localhost:3000`  | Backend API URL |

Set in `.env` at the repo root or export before starting Vite.

## Scripts

| Script          | Description                    |
|-----------------|--------------------------------|
| `pnpm dev`      | Vite dev server on port 5173   |
| `pnpm build`    | Type-check and production build|
| `pnpm preview`  | Preview production build       |

## CSS modules

Import Sass modules with the `.module.scss` extension:

```tsx
import styles from './App.module.scss';

<div className={styles.layout}>...</div>
```

Class names are exported in camelCase (`localsConvention: 'camelCaseOnly'` in Vite config).

Global styles go in `src/styles/global.scss`.

## Docker

The web app runs as part of the root compose stack:

```bash
docker compose up web --build
```

Source code in `web/` is bind-mounted. Vite HMR applies changes without restarting the container.

## Path aliases

Use `@/` to import from `src/`:

```tsx
import { useAppStore } from '@/store/useAppStore';
```
