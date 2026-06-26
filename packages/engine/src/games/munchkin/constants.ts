import type {
  ClassAbility,
  EquippedItems,
  GameSettings,
  MunchkinCard,
  RaceAbility,
} from './types';

// ── Level ─────────────────────────────────────────────────────────────────────

export const MAX_LEVEL = 10;
export const STARTING_LEVEL = 1;
export const MAX_HAND_SIZE = 5;
export const BOSS_INTERVAL = 5;
export const MINIGAME_CHANCE = 0.1;
export const FLEE_DIE_SIDES = 6;
export const FLEE_SUCCESS_MIN = 5;
export const AUCTION_ROUNDS = 2;

// ── Races ─────────────────────────────────────────────────────────────────────

export const RACE_ABILITIES: RaceAbility[] = [
  {
    race: 'human',
    name: 'Adaptable',
    description: 'Humans have no restrictions on items or abilities.',
    passive: true,
  },
  {
    race: 'elf',
    name: 'Run Away!',
    description: 'Elves gain 1 level whenever they successfully flee from combat.',
    passive: true,
  },
  {
    race: 'dwarf',
    name: 'Sturdy',
    description: 'Dwarves can carry 1 extra Big Item.',
    passive: true,
  },
  {
    race: 'halfling',
    name: 'Sneaky',
    description: 'Halflings may discard 1 card to add +1 to any Flee roll.',
    passive: false,
  },
  {
    race: 'orc',
    name: 'Berserk',
    description: 'Orcs get +1 Combat power per level above 3.',
    passive: true,
  },
];

// ── Classes ───────────────────────────────────────────────────────────────────

export const CLASS_ABILITIES: ClassAbility[] = [
  {
    class: 'warrior',
    name: 'Berserk Charge',
    description: 'Once per combat, Warriors may discard 1 card to add +3 to their Combat power.',
    passive: false,
  },
  {
    class: 'wizard',
    name: 'Spellcraft',
    description: 'Wizards may use any number of one-shot items in a single combat.',
    passive: true,
  },
  {
    class: 'thief',
    name: 'Backstab',
    description: 'Once per turn, Thieves may steal 1 item from another player who is fleeing.',
    passive: false,
  },
  {
    class: 'cleric',
    name: 'Turning',
    description: 'Clerics can discard any card to auto-flee from Undead monsters.',
    passive: false,
  },
  {
    class: 'ranger',
    name: 'Monster Lore',
    description: 'Rangers ignore Bad Stuff from monsters with the Animal tag.',
    passive: true,
  },
];

// ── Item Slots ────────────────────────────────────────────────────────────────

export const ITEM_SLOTS: Array<keyof EquippedItems> = [
  'head',
  'body',
  'feet',
  'hand1',
  'hand2',
  'accessory',
];

export const SLOT_LABELS: Record<keyof EquippedItems, string> = {
  head: 'Head',
  body: 'Body',
  feet: 'Feet',
  hand1: 'Hand (Main)',
  hand2: 'Hand (Off)',
  accessory: 'Accessory',
};

// ── Computed Power ────────────────────────────────────────────────────────────

export function computePlayerPower(
  level: number,
  equipped: EquippedItems,
  race: string,
  classType: string,
): number {
  const equippedCards = Object.values(equipped).filter(
    (c): c is MunchkinCard => c !== null,
  );
  const itemBonus = equippedCards.reduce((sum, c) => sum + (c.itemBonus ?? 0), 0);
  let bonus = 0;
  if (race === 'orc' && level > 3) {
    bonus += level - 3;
  }
  return level + itemBonus + bonus;
}

// ── Gold Value ────────────────────────────────────────────────────────────────

export const GOLD_PER_LEVEL = 1000;

// ── Default Settings ──────────────────────────────────────────────────────────

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  maxPlayers: 6,
  minigamesEnabled: true,
  partyVotesEnabled: true,
  bossRaidsEnabled: true,
  auctionEnabled: true,
  allySystemEnabled: true,
  minigameChance: MINIGAME_CHANCE,
  bossInterval: BOSS_INTERVAL,
  startingLevel: STARTING_LEVEL,
  maxLevel: MAX_LEVEL,
};

// ── Empty Equipment ───────────────────────────────────────────────────────────

export const EMPTY_EQUIPPED: EquippedItems = {
  head: null,
  body: null,
  feet: null,
  hand1: null,
  hand2: null,
  accessory: null,
};
