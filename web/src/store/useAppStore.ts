import { create } from 'zustand';

type HealthResponse = {
  status: string;
  service: string;
  database: string;
  timestamp: string;
};

type AppState = {
  count: number;
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  increment: () => void;
  decrement: () => void;
  fetchHealth: () => Promise<void>;
};

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  health: null,
  loading: false,
  error: null,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  fetchHealth: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${apiUrl}/`);

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const health = (await response.json()) as HealthResponse;
      set({ health, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
}));
