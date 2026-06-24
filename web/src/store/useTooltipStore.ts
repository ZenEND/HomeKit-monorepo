import { create } from 'zustand';

const ERROR_TOOLTIP_TIMEOUT_MS = 5000;

export interface ErrorTooltip {
  id: string;
  message: string;
}

interface TooltipState {
  errors: ErrorTooltip[];
  showError: (message: string) => string;
  dismissError: (id: string) => void;
  clearErrors: () => void;
}

let nextTooltipId = 0;
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useTooltipStore = create<TooltipState>((set, get) => ({
  errors: [],
  showError: (message) => {
    const existing = get().errors.find((error) => error.message === message);
    if (existing) {
      const existingTimer = dismissTimers.get(existing.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      dismissTimers.set(
        existing.id,
        setTimeout(() => {
          get().dismissError(existing.id);
        }, ERROR_TOOLTIP_TIMEOUT_MS),
      );

      return existing.id;
    }

    const id = `${Date.now()}-${nextTooltipId++}`;

    set((state) => ({
      errors: [...state.errors, { id, message }],
    }));

    dismissTimers.set(
      id,
      setTimeout(() => {
        get().dismissError(id);
      }, ERROR_TOOLTIP_TIMEOUT_MS),
    );

    return id;
  },
  dismissError: (id) => {
    const timer = dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimers.delete(id);
    }

    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
    }));
  },
  clearErrors: () => {
    dismissTimers.forEach((timer) => clearTimeout(timer));
    dismissTimers.clear();
    set({ errors: [] });
  },
}));
