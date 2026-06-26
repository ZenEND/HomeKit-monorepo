import type {
  AnimationTrigger,
  CombatState,
  GameEvent,
  HelpOffer,
  MunchkinCard,
  MunchkinGameState,
  PlayerState,
} from './types';
import { FLEE_DIE_SIDES, FLEE_SUCCESS_MIN, GOLD_PER_LEVEL, MAX_LEVEL } from './constants';
import { dealToHand, discardCard } from './deck';
import { nanoid } from './utils';

export interface CombatResolutionResult {
  state: MunchkinGameState;
  events: GameEvent[];
  animations: AnimationTrigger[];
}

/** Total combat power for the player side (player + allies + help offers) */
export function computePlayerCombatPower(
  state: MunchkinGameState,
  combat: CombatState,
): number {
  return combat.playerIds.reduce((sum, pid) => {
    const player = state.players[pid];
    if (!player) return sum;
    return sum + player.power;
  }, 0) + combat.helpOffers.reduce((sum, h) => sum + h.powerBonus, 0);
}

/** Total monster power (base + extra monsters + hinder bonuses) */
export function computeMonsterCombatPower(combat: CombatState): number {
  const extraPower = combat.extraMonsters.reduce((s, m) => s + (m.level ?? 0), 0);
  const hinderBonus = combat.hinderCards.reduce((s, c) => s + (c.itemBonus ?? 0), 0);
  return combat.monsterPower + extraPower + hinderBonus;
}

/** Apply "Bad Stuff" to the active player when they lose. Returns updated player. */
function applyBadStuff(
  player: PlayerState,
  monster: MunchkinCard,
  rng: () => number,
): { player: PlayerState; event: string } {
  const badStuff = monster.badStuff ?? 'Nothing bad happens. Lucky you.';

  // Parse simple bad stuff patterns
  const levelMatch = badStuff.match(/lose (\d+) level/i);
  const goldMatch = badStuff.match(/lose (\d+) gold/i);
  const discardItemMatch = badStuff.match(/lose.+item/i);

  let updated = { ...player };

  if (levelMatch) {
    const amount = parseInt(levelMatch[1], 10);
    updated = { ...updated, level: Math.max(1, updated.level - amount) };
  }
  if (goldMatch) {
    const amount = parseInt(goldMatch[1], 10);
    updated = { ...updated, gold: Math.max(0, updated.gold - amount) };
  }
  if (discardItemMatch && !levelMatch && !goldMatch) {
    // Default: lose 1 random equipped item
    const equippedSlots = Object.entries(updated.equipped).filter(([, v]) => v !== null);
    if (equippedSlots.length > 0) {
      const randomSlot = equippedSlots[Math.floor(rng() * equippedSlots.length)][0];
      updated = {
        ...updated,
        equipped: { ...updated.equipped, [randomSlot]: null },
      };
    }
  }

  return { player: updated, event: badStuff };
}

/** Resolve a flee attempt. Returns updated state after flee roll. */
export function resolveFlee(
  state: MunchkinGameState,
  playerId: string,
  rng: () => number,
): CombatResolutionResult {
  const combat = state.combatStack;
  if (!combat) return { state, events: [], animations: [] };

  const player = state.players[playerId];
  if (!player) return { state, events: [], animations: [] };

  // Halfling bonus: +1 per discarded card (handled separately)
  const roll = Math.floor(rng() * FLEE_DIE_SIDES) + 1;
  const success = roll >= FLEE_SUCCESS_MIN;
  const events: GameEvent[] = [];
  const animations: AnimationTrigger[] = [];

  let newState = { ...state };
  let updatedPlayers = { ...state.players };

  if (success) {
    // Successful flee — Elf gains 1 level
    let updatedPlayer = { ...player, status: 'alive' as const };
    if (player.race === 'elf') {
      const newLevel = Math.min(MAX_LEVEL, updatedPlayer.level + 1);
      updatedPlayer = { ...updatedPlayer, level: newLevel };
      animations.push({ type: 'level_up', targetPlayerId: playerId });
      events.push({
        id: nanoid(),
        timestamp: Date.now(),
        type: 'ELF_FLEE_BONUS',
        playerId,
        playerName: player.name,
        text: `${player.name} fled successfully and gained a level (Elf bonus)!`,
      });
    }
    updatedPlayers = { ...updatedPlayers, [playerId]: updatedPlayer };
    events.push({
      id: nanoid(),
      timestamp: Date.now(),
      type: 'FLEE_SUCCESS',
      playerId,
      playerName: player.name,
      text: `${player.name} fled! Roll: ${roll}`,
    });
    newState = {
      ...newState,
      players: updatedPlayers,
      combatStack: { ...combat, resolved: true, outcome: 'flee', fleeRoll: roll },
      phase: 'TURN_END',
    };
  } else {
    // Failed flee — apply bad stuff
    const { player: punishedPlayer, event: badStuffText } = applyBadStuff(
      player,
      combat.monster,
      rng,
    );
    updatedPlayers = { ...updatedPlayers, [playerId]: punishedPlayer };
    animations.push({ type: 'combat_lose', targetPlayerId: playerId });
    events.push({
      id: nanoid(),
      timestamp: Date.now(),
      type: 'FLEE_FAIL',
      playerId,
      playerName: player.name,
      text: `${player.name} failed to flee! Roll: ${roll}. Bad Stuff: ${badStuffText}`,
    });
    newState = {
      ...newState,
      players: updatedPlayers,
      combatStack: { ...combat, resolved: true, outcome: 'lose', fleeRoll: roll },
      phase: 'TURN_END',
    };
  }

  return { state: newState, events, animations };
}

/** Full combat resolution after all help/hinder offers are in. */
export function resolveCombat(
  state: MunchkinGameState,
  context: { rng: () => number },
): CombatResolutionResult {
  const combat = state.combatStack;
  if (!combat) return { state, events: [], animations: [] };

  const { rng } = context;
  const playerPower = computePlayerCombatPower(state, combat);
  const monsterPower = computeMonsterCombatPower(combat);
  const events: GameEvent[] = [];
  const animations: AnimationTrigger[] = [];
  let updatedPlayers = { ...state.players };

  const activePlayerId = state.activePlayerId;
  const activePlayer = state.players[activePlayerId];
  if (!activePlayer) return { state, events: [], animations: [] };

  if (playerPower > monsterPower) {
    // ── WIN ────────────────────────────────────────────────────────────────────
    const levelGain = 1;
    const treasureCount = combat.monster.treasureCount ?? 1;
    animations.push({ type: 'combat_win', targetPlayerId: activePlayerId });

    // Grant levels
    let newLevel = Math.min(MAX_LEVEL, activePlayer.level + levelGain);
    if (newLevel > activePlayer.level) {
      animations.push({ type: 'level_up', targetPlayerId: activePlayerId });
    }
    let updatedActive = { ...activePlayer, level: newLevel };

    // Sell items: gold sells don't trigger here (they're manual)
    // Distribute treasure cards
    let { doorDeck, treasureDeck, discardDoor, discardTreasure } = state;
    const dealt = dealToHand(
      updatedActive.hand,
      treasureDeck,
      discardTreasure,
      treasureCount,
      rng,
    );
    updatedActive = { ...updatedActive, hand: dealt.hand };
    treasureDeck = dealt.deck;
    discardTreasure = dealt.discard;

    // Help-offer reward sharing: helpers get levels
    for (const offer of combat.helpOffers) {
      const helper = updatedPlayers[offer.fromPlayerId];
      if (!helper) continue;
      const shareLevel = Math.min(MAX_LEVEL, helper.level + offer.rewardShare);
      updatedPlayers = {
        ...updatedPlayers,
        [offer.fromPlayerId]: { ...helper, level: shareLevel },
      };
      if (shareLevel > helper.level) {
        animations.push({ type: 'level_up', targetPlayerId: offer.fromPlayerId });
      }
    }

    updatedPlayers = { ...updatedPlayers, [activePlayerId]: updatedActive };

    events.push({
      id: nanoid(),
      timestamp: Date.now(),
      type: 'COMBAT_WIN',
      playerId: activePlayerId,
      playerName: activePlayer.name,
      text: `${activePlayer.name} defeated ${combat.monster.name}! +${levelGain} level, +${treasureCount} Treasure.`,
      animationTrigger: { type: 'combat_win', targetPlayerId: activePlayerId },
    });

    // Discard monster
    discardDoor = discardCard(combat.monster, discardDoor);

    const newState: MunchkinGameState = {
      ...state,
      players: updatedPlayers,
      doorDeck,
      treasureDeck,
      discardDoor,
      discardTreasure,
      combatStack: { ...combat, resolved: true, outcome: 'win' },
      phase: state.settings.maxLevel === newLevel ? 'GAME_OVER' : 'LOOT',
      winnerId: state.settings.maxLevel === newLevel ? activePlayerId : null,
    };
    return { state: newState, events, animations };
  } else {
    // ── LOSE ───────────────────────────────────────────────────────────────────
    const { player: punishedPlayer, event: badStuffText } = applyBadStuff(
      activePlayer,
      combat.monster,
      rng,
    );
    updatedPlayers = { ...updatedPlayers, [activePlayerId]: punishedPlayer };
    animations.push({ type: 'combat_lose', targetPlayerId: activePlayerId });

    events.push({
      id: nanoid(),
      timestamp: Date.now(),
      type: 'COMBAT_LOSE',
      playerId: activePlayerId,
      playerName: activePlayer.name,
      text: `${activePlayer.name} lost to ${combat.monster.name}! Bad Stuff: ${badStuffText}`,
      animationTrigger: { type: 'combat_lose', targetPlayerId: activePlayerId },
    });

    return {
      state: {
        ...state,
        players: updatedPlayers,
        combatStack: { ...combat, resolved: true, outcome: 'lose' },
        phase: 'TURN_END',
      },
      events,
      animations,
    };
  }
}

/** Add a help offer to active combat. */
export function addHelpOffer(
  state: MunchkinGameState,
  offer: HelpOffer,
): MunchkinGameState {
  if (!state.combatStack) return state;
  return {
    ...state,
    combatStack: {
      ...state.combatStack,
      helpOffers: [...state.combatStack.helpOffers, offer],
    },
  };
}

/** Add a hinder card to active combat. */
export function addHinderCard(
  state: MunchkinGameState,
  card: MunchkinCard,
  fromPlayerId: string,
): MunchkinGameState {
  if (!state.combatStack) return state;
  const player = state.players[fromPlayerId];
  if (!player) return state;

  const newHand = player.hand.filter((c) => c.id !== card.id);
  const updatedPlayers = {
    ...state.players,
    [fromPlayerId]: { ...player, hand: newHand },
  };

  return {
    ...state,
    players: updatedPlayers,
    combatStack: {
      ...state.combatStack,
      hinderCards: [...state.combatStack.hinderCards, card],
    },
  };
}
