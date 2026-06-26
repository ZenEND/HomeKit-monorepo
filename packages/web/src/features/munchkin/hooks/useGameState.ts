import { create } from 'zustand';
import * as jsonpatch from 'fast-json-patch';
import type { MunchkinGameState, PlayerState, MunchkinCard, Phase } from '@homekit/engine';

interface GameStore {
  state: MunchkinGameState | null;
  setState: (state: MunchkinGameState) => void;
  applyPatch: (patch: jsonpatch.Operation[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,

  setState(state) {
    set({ state });
  },

  applyPatch(patch) {
    const current = get().state;
    if (!current) return;
    try {
      const patched = jsonpatch.applyPatch(
        JSON.parse(JSON.stringify(current)) as MunchkinGameState,
        patch,
        true,
        false,
      ).newDocument;
      set({ state: patched });
    } catch (err) {
      console.error('Failed to apply state patch', err);
    }
  },

  reset() {
    set({ state: null });
  },
}));

// ── Selector hooks ─────────────────────────────────────────────────────────────

export function usePhase(): Phase | null {
  return useGameStore((s) => s.state?.phase ?? null);
}

export function useActivePlayerId(): string | null {
  return useGameStore((s) => s.state?.activePlayerId ?? null);
}

export function usePlayer(playerId: string): PlayerState | null {
  return useGameStore((s) => s.state?.players[playerId] ?? null);
}

export function useMyHand(myPlayerId: string): MunchkinCard[] {
  return useGameStore((s) => s.state?.players[myPlayerId]?.hand ?? []);
}

export function useAllPlayers(): PlayerState[] {
  return useGameStore((s) => {
    const state = s.state;
    if (!state) return [];
    return state.turnOrder
      .map((id) => state.players[id])
      .filter((p): p is PlayerState => Boolean(p));
  });
}

export function useCombatStack() {
  return useGameStore((s) => s.state?.combatStack ?? null);
}

export function useEventLog() {
  return useGameStore((s) => s.state?.eventLog ?? []);
}

export function useRound(): number {
  return useGameStore((s) => s.state?.round ?? 0);
}

export function useDiceRollState() {
  return useGameStore((s) => s.state?.diceRollState ?? null);
}
