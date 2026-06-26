import {
  EffectCategory,
  EffectContext,
  EffectDefinition,
  EffectInstance,
  GameState,
} from './types';
import { progressEffects } from './definitions/progress';
import { inventoryEffects } from './definitions/inventory';
import { lootEffects } from './definitions/loot';
import { turnEffects } from './definitions/turn';
import { combatEffects } from './definitions/combat';
import { situationEffects } from './definitions/situation';
import { questEffects } from './definitions/quest';
import { gmEffects } from './definitions/gm';

export class EffectRegistry {
  private readonly definitions = new Map<string, EffectDefinition>();

  register(def: EffectDefinition): void {
    this.definitions.set(def.id, def);
  }

  getAll(): EffectDefinition[] {
    return Array.from(this.definitions.values());
  }

  getByCategory(cat: EffectCategory): EffectDefinition[] {
    return this.getAll().filter((def) => def.category === cat);
  }

  getById(id: string): EffectDefinition | undefined {
    return this.definitions.get(id);
  }

  execute(
    instance: EffectInstance,
    state: GameState,
    _context: EffectContext,
  ): GameState {
    const def = this.definitions.get(instance.definitionId);

    if (!def) {
      throw new Error(`Unknown effect definition: "${instance.definitionId}"`);
    }

    // Actual execution is delegated to game modules at runtime.
    // This registry acts as a catalogue and validation layer.
    return state;
  }
}

export function createDefaultRegistry(): EffectRegistry {
  const registry = new EffectRegistry();

  const allDefinitions = [
    ...progressEffects,
    ...inventoryEffects,
    ...lootEffects,
    ...turnEffects,
    ...combatEffects,
    ...situationEffects,
    ...questEffects,
    ...gmEffects,
  ];

  for (const def of allDefinitions) {
    registry.register(def);
  }

  return registry;
}
