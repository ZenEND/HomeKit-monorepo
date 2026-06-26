import type { GamePlugin } from './types';

export class PluginRegistry {
  private static instance: PluginRegistry | null = null;
  private readonly plugins = new Map<string, GamePlugin<unknown, unknown>>();

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register<S, A>(plugin: GamePlugin<S, A>): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered. Use replace() to override.`);
    }
    this.plugins.set(plugin.id, plugin as GamePlugin<unknown, unknown>);
  }

  replace<S, A>(plugin: GamePlugin<S, A>): void {
    this.plugins.set(plugin.id, plugin as GamePlugin<unknown, unknown>);
  }

  get<S = unknown, A = unknown>(id: string): GamePlugin<S, A> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin "${id}" is not registered. Available: ${[...this.plugins.keys()].join(', ')}`);
    }
    return plugin as GamePlugin<S, A>;
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  getAll(): GamePlugin<unknown, unknown>[] {
    return Array.from(this.plugins.values());
  }

  /** Reset — useful for testing */
  clear(): void {
    this.plugins.clear();
  }
}

export const pluginRegistry = PluginRegistry.getInstance();
