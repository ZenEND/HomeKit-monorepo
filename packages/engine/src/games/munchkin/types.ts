// ── Phase ─────────────────────────────────────────────────────────────────────

export type Phase =
  | 'WAITING'
  | 'DOOR_DRAW'
  | 'COMBAT'
  | 'LOOT'
  | 'CHARITY'
  | 'MINIGAME'
  | 'PARTY_VOTE'
  | 'BOSS_RAID'
  | 'AUCTION'
  | 'DOOR_EVENT'
  | 'TURN_END'
  | 'GAME_OVER';

// ── Card ──────────────────────────────────────────────────────────────────────

export type CardType = 'DOOR' | 'TREASURE' | 'PARTY_VOTE' | 'CURSE' | 'MINIGAME' | 'DOOR_EVENT';
export type CardSubtype =
  | 'monster'
  | 'item'
  | 'race'
  | 'class'
  | 'ally'
  | 'boss'
  | 'situation'
  | 'curse'
  | 'party_vote'
  | 'minigame'
  | 'gold'
  | 'level_up'
  | 'door_event';

// ── Dice Roll System ──────────────────────────────────────────────────────────

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

/** The outcome key for a dice-roll tier */
export type DiceOutcomeKey =
  | 'critical_success'
  | 'success'
  | 'partial'
  | 'fail'
  | 'critical_fail';

/** A single reward/punishment tier for a dice roll outcome */
export interface DiceOutcomeTier {
  key: DiceOutcomeKey;
  label: string;
  /** Minimum total roll value to trigger this tier (inclusive). For critical_fail this is the exact minimum possible. */
  minRoll: number;
  /** Maximum total roll value (inclusive). Use Infinity / null for the highest tier. */
  maxRoll: number | null;
  /** Description shown to players when this outcome fires */
  description: string;
  /** Effect definitions to apply (level changes, card draws, etc.) */
  effects: DiceOutcomeEffect[];
  /** Particle / animation type for this outcome */
  animationType?: 'celebrate' | 'curse' | 'neutral' | 'death';
}

/** A simple inline effect for a dice outcome (no need for full EffectInstance here) */
export interface DiceOutcomeEffect {
  type:
    | 'gain_level'
    | 'lose_level'
    | 'draw_treasure'
    | 'draw_door'
    | 'lose_gold'
    | 'gain_gold'
    | 'discard_item'
    | 'skip_turn'
    | 'custom_text';
  amount?: number;
  target?: 'active_player' | 'all' | 'left' | 'right';
  customText?: string;
}

/** Full dice roll configuration attached to a DoorEvent card */
export interface DiceRollConfig {
  /** Number of dice, e.g. 2 for 2d6 */
  diceCount: number;
  diceType: DiceType;
  /** Whether to show the roll result to all players before applying */
  revealBeforeApply: boolean;
  /** The outcome tiers, ordered from best to worst */
  tiers: DiceOutcomeTier[];
}

/** Active dice roll state during DOOR_EVENT phase */
export interface DiceRollState {
  cardId: string;
  cardName: string;
  situationText: string;
  config: DiceRollConfig;
  /** Populated after the roll */
  rollResult: number[] | null;
  totalRoll: number | null;
  resolvedTier: DiceOutcomeTier | null;
  resolved: boolean;
}

export type ElementTag = 'fire' | 'water' | 'cold' | 'poison' | 'undead' | 'animal' | 'flying';

export interface MunchkinCard {
  id: string;
  type: CardType;
  subtype: CardSubtype;
  name: string;
  description: string;
  flavorText?: string;
  imageUrl?: string;
  // Monster-specific
  level?: number;
  treasureCount?: number;
  badStuff?: string;
  // Item-specific
  itemSlot?: 'head' | 'body' | 'feet' | 'hand' | 'accessory';
  itemBonus?: number;
  itemValue?: number;
  // Door Event / Situation-specific
  /** Narrative situation text shown on screen when the card is drawn */
  situationText?: string;
  /** Dice roll configuration — if present, triggers DOOR_EVENT phase */
  diceRollConfig?: DiceRollConfig;
  bigItem?: boolean;
  raceRestrict?: Race[];
  classRestrict?: Class[];
  // Situation-specific
  trigger?: 'immediate' | 'delayed_1_round' | 'persistent_until_end_of_turn';
  scope?: 'active_player' | 'all_players' | 'target_player' | 'combat';
  elementTags?: ElementTag[];
  tags?: string[];
}

// ── Race & Class ──────────────────────────────────────────────────────────────

export type Race = 'human' | 'elf' | 'dwarf' | 'halfling' | 'orc';
export type Class = 'warrior' | 'wizard' | 'thief' | 'cleric' | 'ranger';

export interface RaceAbility {
  race: Race;
  name: string;
  description: string;
  passive: boolean;
}

export interface ClassAbility {
  class: Class;
  name: string;
  description: string;
  passive: boolean;
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export interface EquippedItems {
  head: MunchkinCard | null;
  body: MunchkinCard | null;
  feet: MunchkinCard | null;
  hand1: MunchkinCard | null;
  hand2: MunchkinCard | null;
  accessory: MunchkinCard | null;
}

// ── Player ────────────────────────────────────────────────────────────────────

export interface PlayerState {
  id: string;
  name: string;
  avatarSeed: string;
  level: number;
  gold: number;
  race: Race;
  class: Class;
  equipped: EquippedItems;
  hand: MunchkinCard[];
  /** Computed: level + item bonuses + class bonus */
  power: number;
  status: 'alive' | 'dead' | 'fleeing';
  allyId: string | null;
  /** Carry effects active on this player */
  activeEffects: string[];
  /** Whether the player has sold items this turn (once per turn limit) */
  hasSoldThisTurn: boolean;
  /** Whether the player has used their class ability this turn */
  hasUsedClassAbility: boolean;
}

// ── Combat ────────────────────────────────────────────────────────────────────

export interface HelpOffer {
  fromPlayerId: string;
  powerBonus: number;
  rewardShare: number;
}

export interface CombatState {
  monster: MunchkinCard;
  monsterPower: number;
  playerIds: string[];
  helpOffers: HelpOffer[];
  hinderCards: MunchkinCard[];
  extraMonsters: MunchkinCard[];
  resolved: boolean;
  outcome: 'win' | 'lose' | 'flee' | null;
  fleeRoll?: number;
}

// ── Auction ───────────────────────────────────────────────────────────────────

export interface AuctionState {
  item: MunchkinCard;
  sellerPlayerId: string;
  highestBid: number;
  highestBidderId: string | null;
  bidsReceived: Record<string, number>;
  roundsLeft: number;
}

// ── Minigame ──────────────────────────────────────────────────────────────────

export type MinigameType = 'type_word' | 'trivia' | 'click_target';

export interface MinigameState {
  type: MinigameType;
  prompt: string;
  answer?: string;
  timeoutSeconds: number;
  startedAt: number;
  winnerId: string | null;
}

// ── Game Event ────────────────────────────────────────────────────────────────

export interface GameEvent {
  id: string;
  timestamp: number;
  type: string;
  playerId?: string;
  playerName?: string;
  text: string;
  animationTrigger?: AnimationTrigger;
}

export interface AnimationTrigger {
  type:
    | 'card_flip'
    | 'level_up'
    | 'level_down'
    | 'combat_win'
    | 'combat_lose'
    | 'curse'
    | 'boss_spawn'
    | 'loot'
    | 'effect_fire'
    | 'effect_water'
    | 'effect_cold'
    | 'effect_poison';
  targetPlayerId?: string;
  cardId?: string;
  data?: Record<string, unknown>;
}

// ── Party Vote ────────────────────────────────────────────────────────────────

export interface PartyVoteState {
  card: MunchkinCard;
  votes: Record<string, boolean>;
  requiredVotes: number;
  resolved: boolean;
}

// ── Game State ────────────────────────────────────────────────────────────────

export interface MunchkinGameState {
  roomId: string;
  pluginId: 'munchkin';
  phase: Phase;
  round: number;
  activePlayerId: string;
  turnOrder: string[];
  players: Record<string, PlayerState>;
  doorDeck: MunchkinCard[];
  treasureDeck: MunchkinCard[];
  discardDoor: MunchkinCard[];
  discardTreasure: MunchkinCard[];
  /** Cards currently face-up on the table */
  tableCards: MunchkinCard[];
  combatStack: CombatState | null;
  bossRaidActive: boolean;
  bossCard: MunchkinCard | null;
  partyVote: PartyVoteState | null;
  minigame: MinigameState | null;
  auction: AuctionState | null;
  diceRollState: DiceRollState | null;
  eventLog: GameEvent[];
  spectators: string[];
  settings: GameSettings;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  winnerId: string | null;
}

export interface GameSettings {
  maxPlayers: number;
  minigamesEnabled: boolean;
  partyVotesEnabled: boolean;
  bossRaidsEnabled: boolean;
  auctionEnabled: boolean;
  allySystemEnabled: boolean;
  minigameChance: number;
  bossInterval: number;
  startingLevel: number;
  maxLevel: number;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type MunchkinAction =
  | { type: 'KICK_DOOR' }
  | { type: 'FIGHT' }
  | { type: 'FLEE' }
  | { type: 'HELP'; targetPlayerId: string; powerBonus: number; rewardShare: number }
  | { type: 'HINDER'; cardId: string }
  | { type: 'ADD_MONSTER'; cardId: string }
  | { type: 'PLAY_CARD'; cardId: string; targetPlayerId?: string }
  | { type: 'EQUIP_ITEM'; cardId: string }
  | { type: 'UNEQUIP_ITEM'; slot: keyof EquippedItems }
  | { type: 'SELL_ITEM'; cardId: string }
  | { type: 'DISCARD_CARD'; cardId: string }
  | { type: 'LOOT_ROOM' }
  | { type: 'CHARITY_GIVE'; cardId: string; toPlayerId: string }
  | { type: 'CHARITY_DONE' }
  | { type: 'PARTY_VOTE_CAST'; vote: boolean }
  | { type: 'MINIGAME_ANSWER'; answer: string }
  | { type: 'BOSS_RAID_FIGHT' }
  | { type: 'BOSS_RAID_FLEE' }
  | { type: 'AUCTION_BID'; amount: number }
  | { type: 'AUCTION_PASS' }
  | { type: 'AUCTION_CLOSE' }
  | { type: 'START_AUCTION'; cardId: string }
  | { type: 'ALLY_REQUEST'; targetPlayerId: string }
  | { type: 'ALLY_ACCEPT'; fromPlayerId: string }
  | { type: 'ALLY_REJECT'; fromPlayerId: string }
  | { type: 'USE_CLASS_ABILITY' }
  | { type: 'END_TURN' }
  | { type: 'FORCE_GAME_OVER' }
  /** Trigger a dice roll for the active door event */
  | { type: 'ROLL_DICE' }
  /** Admin or timeout resolves the door event after dice are shown */
  | { type: 'RESOLVE_DOOR_EVENT' };
