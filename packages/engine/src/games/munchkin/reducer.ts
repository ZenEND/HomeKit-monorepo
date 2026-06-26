import type { ActionContext } from '../../plugin/types';
import type {
  CombatState,
  DiceOutcomeEffect,
  DiceRollState,
  EquippedItems,
  GameEvent,
  MunchkinAction,
  MunchkinGameState,
  Phase,
  PlayerState,
} from './types';
import {
  BOSS_INTERVAL,
  DEFAULT_GAME_SETTINGS,
  EMPTY_EQUIPPED,
  GOLD_PER_LEVEL,
  MAX_HAND_SIZE,
  MAX_LEVEL,
  MINIGAME_CHANCE,
  computePlayerPower,
} from './constants';
import {
  addHelpOffer,
  addHinderCard,
  resolveCombat,
  resolveFlee,
} from './combat';
import { dealToHand, discardCard, drawCard, shuffleDeck } from './deck';
import { nanoid } from './utils';
import {
  MUNCHKIN_BOSS_CARDS,
  MUNCHKIN_DOOR_DECK,
  MUNCHKIN_DOOR_EVENT_CARDS,
  MUNCHKIN_MINIGAME_CARDS,
  MUNCHKIN_PARTY_VOTE_DECK,
  MUNCHKIN_TREASURE_DECK,
} from './seed-data';

// ── Helpers ────────────────────────────────────────────────────────────────────

function addEvent(state: MunchkinGameState, partial: Omit<GameEvent, 'id' | 'timestamp'>): MunchkinGameState {
  const event: GameEvent = { id: nanoid(), timestamp: Date.now(), ...partial };
  const eventLog = [...state.eventLog, event].slice(-100);
  return { ...state, eventLog };
}

function recomputePower(player: PlayerState): PlayerState {
  const power = computePlayerPower(player.level, player.equipped, player.race, player.class);
  return { ...player, power };
}

function nextTurnPlayer(state: MunchkinGameState): string {
  const idx = state.turnOrder.indexOf(state.activePlayerId);
  return state.turnOrder[(idx + 1) % state.turnOrder.length];
}

function advanceTurn(state: MunchkinGameState): MunchkinGameState {
  const nextPlayerId = nextTurnPlayer(state);
  const newRound = nextPlayerId === state.turnOrder[0]
    ? state.round + 1
    : state.round;

  let newState: MunchkinGameState = {
    ...state,
    activePlayerId: nextPlayerId,
    round: newRound,
    phase: 'DOOR_DRAW',
    combatStack: null,
    tableCards: [],
  };

  // Reset per-turn flags
  const player = newState.players[nextPlayerId];
  if (player) {
    newState = {
      ...newState,
      players: {
        ...newState.players,
        [nextPlayerId]: {
          ...player,
          hasSoldThisTurn: false,
          hasUsedClassAbility: false,
          status: 'alive',
        },
      },
    };
  }

  // Check boss raid interval
  const settings = state.settings ?? DEFAULT_GAME_SETTINGS;
  if (
    settings.bossRaidsEnabled &&
    !newState.bossRaidActive &&
    newRound > 0 &&
    newRound % BOSS_INTERVAL === 0 &&
    MUNCHKIN_BOSS_CARDS.length > 0
  ) {
    const bossIdx = Math.floor(Math.random() * MUNCHKIN_BOSS_CARDS.length);
    newState = {
      ...newState,
      bossRaidActive: true,
      bossCard: MUNCHKIN_BOSS_CARDS[bossIdx],
      phase: 'BOSS_RAID',
    };
  }

  // Check minigame
  if (
    settings.minigamesEnabled &&
    !newState.bossRaidActive &&
    Math.random() < (settings.minigameChance ?? MINIGAME_CHANCE) &&
    MUNCHKIN_MINIGAME_CARDS.length > 0
  ) {
    const card = MUNCHKIN_MINIGAME_CARDS[Math.floor(Math.random() * MUNCHKIN_MINIGAME_CARDS.length)];
    newState = {
      ...newState,
      phase: 'MINIGAME',
      minigame: {
        type: 'type_word',
        prompt: card.name,
        timeoutSeconds: 30,
        startedAt: Date.now(),
        winnerId: null,
      },
    };
  }

  return newState;
}

// ── Initial State ─────────────────────────────────────────────────────────────

export function buildInitialState(
  roomId: string,
  playerIds: string[],
  playerNames: Record<string, string>,
  settings = DEFAULT_GAME_SETTINGS,
  rng: () => number = Math.random,
): MunchkinGameState {
  const shuffledDoor = shuffleDeck([...MUNCHKIN_DOOR_DECK, ...MUNCHKIN_DOOR_EVENT_CARDS], rng);
  const shuffledTreasure = shuffleDeck([...MUNCHKIN_TREASURE_DECK], rng);

  const players: Record<string, PlayerState> = {};
  let doorDeck = shuffledDoor;
  let treasureDeck = shuffledTreasure;
  const discardDoor = [] as typeof doorDeck;
  const discardTreasure = [] as typeof treasureDeck;

  for (const id of playerIds) {
    let hand: typeof doorDeck = [];

    // Deal 2 door + 2 treasure cards
    const d = dealToHand(hand, doorDeck, discardDoor, 2, rng);
    hand = d.hand;
    doorDeck = d.deck;

    const t = dealToHand(hand, treasureDeck, discardTreasure, 2, rng);
    hand = t.hand;
    treasureDeck = t.deck;

    const equipped: EquippedItems = { ...EMPTY_EQUIPPED };
    players[id] = {
      id,
      name: playerNames[id] ?? id,
      avatarSeed: id,
      level: settings.startingLevel,
      gold: 0,
      race: 'human',
      class: 'warrior',
      equipped,
      hand,
      power: settings.startingLevel,
      status: 'alive',
      allyId: null,
      activeEffects: [],
      hasSoldThisTurn: false,
      hasUsedClassAbility: false,
    };
  }

  const partyVoteDeck = shuffleDeck([...MUNCHKIN_PARTY_VOTE_DECK], rng);

  return {
    roomId,
    pluginId: 'munchkin',
    phase: 'DOOR_DRAW',
    round: 1,
    activePlayerId: playerIds[0],
    turnOrder: [...playerIds],
    players,
    doorDeck,
    treasureDeck,
    discardDoor,
    discardTreasure,
    tableCards: [...partyVoteDeck],
    combatStack: null,
    bossRaidActive: false,
    bossCard: null,
    partyVote: null,
    minigame: null,
    auction: null,
    diceRollState: null,
    eventLog: [],
    spectators: [],
    settings,
    createdAt: Date.now(),
    startedAt: Date.now(),
    finishedAt: null,
    winnerId: null,
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────────

export function applyMunchkinAction(
  state: MunchkinGameState,
  action: MunchkinAction,
  context: ActionContext,
): MunchkinGameState {
  const { playerId, random: rng } = context;
  const player = state.players[playerId];

  switch (action.type) {

    // ── KICK_DOOR ───────────────────────────────────────────────────────────────
    case 'KICK_DOOR': {
      if (state.phase !== 'DOOR_DRAW') return state;
      if (playerId !== state.activePlayerId) return state;

      let deck = state.doorDeck;
      let discard = state.discardDoor;

      if (deck.length === 0) {
        deck = shuffleDeck([...discard], rng);
        discard = [];
      }

      const [card, remaining] = drawCard(deck);
      if (!card) return state;

      let newState: MunchkinGameState = {
        ...state,
        doorDeck: remaining,
        tableCards: [...state.tableCards, card],
      };

      if (card.subtype === 'monster' || card.subtype === 'boss') {
        const combat: CombatState = {
          monster: card,
          monsterPower: card.level ?? 1,
          playerIds: [playerId],
          helpOffers: [],
          hinderCards: [],
          extraMonsters: [],
          resolved: false,
          outcome: null,
        };
        newState = {
          ...newState,
          phase: 'COMBAT',
          combatStack: combat,
        };
      } else if (card.subtype === 'curse') {
        // Apply curse immediately — simplified: just add to hand for now
        const p = state.players[playerId];
        if (p) {
          newState = {
            ...newState,
            players: {
              ...newState.players,
              [playerId]: { ...p, hand: [...p.hand, card] },
            },
          };
        }
        newState = { ...newState, phase: 'LOOT', discardDoor: discardCard(card, discard) };
      } else if (card.subtype === 'door_event' && card.diceRollConfig) {
        // Door Event with dice roll
        const diceRollState: DiceRollState = {
          cardId: card.id,
          cardName: card.name,
          situationText: card.situationText ?? card.description,
          config: card.diceRollConfig,
          rollResult: null,
          totalRoll: null,
          resolvedTier: null,
          resolved: false,
        };
        newState = {
          ...newState,
          phase: 'DOOR_EVENT',
          diceRollState,
          discardDoor: discardCard(card, discard),
        };
      } else if (card.subtype === 'situation') {
        // Situation: trigger effect and move on
        newState = { ...newState, phase: 'LOOT', discardDoor: discardCard(card, discard) };
      } else {
        // Race, class, ally, misc — keep in hand
        if (player) {
          newState = {
            ...newState,
            players: {
              ...newState.players,
              [playerId]: { ...player, hand: [...player.hand, card] },
            },
          };
        }
        newState = { ...newState, phase: 'LOOT' };
      }

      return addEvent(newState, {
        type: 'DOOR_DRAW',
        playerId,
        playerName: player?.name,
        text: `${player?.name ?? playerId} kicked down the door and found: ${card.name}`,
        animationTrigger: { type: 'card_flip', cardId: card.id },
      });
    }

    // ── FIGHT ───────────────────────────────────────────────────────────────────
    case 'FIGHT': {
      if (state.phase !== 'COMBAT') return state;
      const result = resolveCombat(state, { rng });
      let newState = result.state;
      for (const evt of result.events) {
        const eventLog = [...newState.eventLog, evt].slice(-100);
        newState = { ...newState, eventLog };
      }
      return newState;
    }

    // ── FLEE ────────────────────────────────────────────────────────────────────
    case 'FLEE': {
      if (state.phase !== 'COMBAT') return state;
      const result = resolveFlee(state, playerId, rng);
      let newState = result.state;
      for (const evt of result.events) {
        const eventLog = [...newState.eventLog, evt].slice(-100);
        newState = { ...newState, eventLog };
      }
      return newState;
    }

    // ── HELP ────────────────────────────────────────────────────────────────────
    case 'HELP': {
      if (state.phase !== 'COMBAT') return state;
      if (playerId === state.activePlayerId) return state;
      return addHelpOffer(state, {
        fromPlayerId: playerId,
        powerBonus: action.powerBonus,
        rewardShare: action.rewardShare,
      });
    }

    // ── HINDER ──────────────────────────────────────────────────────────────────
    case 'HINDER': {
      if (state.phase !== 'COMBAT') return state;
      if (playerId === state.activePlayerId) return state;
      if (!player) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card) return state;
      return addHinderCard(state, card, playerId);
    }

    // ── ADD_MONSTER (hinder by adding extra monster) ────────────────────────────
    case 'ADD_MONSTER': {
      if (state.phase !== 'COMBAT') return state;
      if (!player) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card || card.subtype !== 'monster') return state;
      const newHand = player.hand.filter((c) => c.id !== action.cardId);
      return {
        ...state,
        players: { ...state.players, [playerId]: { ...player, hand: newHand } },
        combatStack: state.combatStack
          ? { ...state.combatStack, extraMonsters: [...state.combatStack.extraMonsters, card] }
          : null,
      };
    }

    // ── LOOT_ROOM ───────────────────────────────────────────────────────────────
    case 'LOOT_ROOM': {
      if (state.phase !== 'LOOT') return state;
      if (playerId !== state.activePlayerId) return state;
      if (!player) return state;

      const dealt = dealToHand(player.hand, state.doorDeck, state.discardDoor, 1, rng);
      const updatedPlayer = { ...player, hand: dealt.hand };

      let newState: MunchkinGameState = {
        ...state,
        players: { ...state.players, [playerId]: updatedPlayer },
        doorDeck: dealt.deck,
        discardDoor: dealt.discard,
      };

      // Check charity
      const handSize = updatedPlayer.hand.length;
      newState = { ...newState, phase: handSize > MAX_HAND_SIZE ? 'CHARITY' : 'TURN_END' };

      return addEvent(newState, {
        type: 'LOOT_ROOM',
        playerId,
        playerName: player.name,
        text: `${player.name} looted the room.`,
      });
    }

    // ── PLAY_CARD ────────────────────────────────────────────────────────────────
    case 'PLAY_CARD': {
      if (!player) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card) return state;
      const newHand = player.hand.filter((c) => c.id !== action.cardId);

      // Handle gold cards immediately
      if (card.subtype === 'gold' && card.itemValue) {
        const updatedPlayer = recomputePower({ ...player, hand: newHand, gold: player.gold + card.itemValue });
        return {
          ...state,
          players: { ...state.players, [playerId]: updatedPlayer },
          discardTreasure: discardCard(card, state.discardTreasure),
        };
      }
      // Handle level-up cards
      if (card.subtype === 'level_up') {
        const newLevel = Math.min(MAX_LEVEL, player.level + 1);
        const updatedPlayer = recomputePower({ ...player, hand: newHand, level: newLevel });
        const newState = {
          ...state,
          players: { ...state.players, [playerId]: updatedPlayer },
          discardTreasure: discardCard(card, state.discardTreasure),
          phase: newLevel >= MAX_LEVEL ? 'GAME_OVER' as Phase : state.phase,
          winnerId: newLevel >= MAX_LEVEL ? playerId : state.winnerId,
        };
        return addEvent(newState, {
          type: 'LEVEL_UP',
          playerId,
          playerName: player.name,
          text: `${player.name} gained a level! Now level ${newLevel}.`,
          animationTrigger: { type: 'level_up', targetPlayerId: playerId },
        });
      }
      // Handle race/class cards
      if (card.subtype === 'race') {
        const updatedPlayer = recomputePower({
          ...player,
          hand: newHand,
          race: card.name.toLowerCase() as typeof player.race,
        });
        return {
          ...state,
          players: { ...state.players, [playerId]: updatedPlayer },
          discardDoor: discardCard(card, state.discardDoor),
        };
      }
      if (card.subtype === 'class') {
        const updatedPlayer = recomputePower({
          ...player,
          hand: newHand,
          class: card.name.toLowerCase() as typeof player.class,
        });
        return {
          ...state,
          players: { ...state.players, [playerId]: updatedPlayer },
          discardDoor: discardCard(card, state.discardDoor),
        };
      }

      // Otherwise put on table
      const updatedPlayer = { ...player, hand: newHand };
      return {
        ...state,
        players: { ...state.players, [playerId]: updatedPlayer },
        tableCards: [...state.tableCards, card],
      };
    }

    // ── EQUIP_ITEM ───────────────────────────────────────────────────────────────
    case 'EQUIP_ITEM': {
      if (!player) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card || !card.itemSlot) return state;

      // Race/class restrictions
      if (card.raceRestrict?.length && !card.raceRestrict.includes(player.race)) return state;
      if (card.classRestrict?.length && !card.classRestrict.includes(player.class)) return state;

      // Big item limit (1 per player unless Dwarf)
      if (card.bigItem) {
        const equippedBigItems = Object.values(player.equipped).filter((c) => c?.bigItem).length;
        const maxBig = player.race === 'dwarf' ? 2 : 1;
        if (equippedBigItems >= maxBig) return state;
      }

      const rawSlot = card.itemSlot;
      const slotKey: keyof EquippedItems =
        rawSlot === 'hand'
          ? player.equipped.hand1 === null
            ? 'hand1'
            : 'hand2'
          : (rawSlot as keyof EquippedItems);
      const prevItem = player.equipped[slotKey];

      let newHand = player.hand.filter((c) => c.id !== action.cardId);
      if (prevItem) {
        newHand = [...newHand, prevItem]; // bump old item to hand
      }

      const newEquipped: EquippedItems = { ...player.equipped, [slotKey]: card };
      const updatedPlayer = recomputePower({ ...player, hand: newHand, equipped: newEquipped });
      return {
        ...state,
        players: { ...state.players, [playerId]: updatedPlayer },
      };
    }

    // ── UNEQUIP_ITEM ─────────────────────────────────────────────────────────────
    case 'UNEQUIP_ITEM': {
      if (!player) return state;
      const card = player.equipped[action.slot];
      if (!card) return state;
      const newEquipped: EquippedItems = { ...player.equipped, [action.slot]: null };
      const updatedPlayer = recomputePower({
        ...player,
        equipped: newEquipped,
        hand: [...player.hand, card],
      });
      return { ...state, players: { ...state.players, [playerId]: updatedPlayer } };
    }

    // ── SELL_ITEM ────────────────────────────────────────────────────────────────
    case 'SELL_ITEM': {
      if (!player) return state;
      if (player.hasSoldThisTurn) return state; // once per turn

      let card = player.hand.find((c) => c.id === action.cardId);
      let newHand = player.hand.filter((c) => c.id !== action.cardId);
      let fromEquipped = false;

      if (!card) {
        // Check equipped
        for (const [slot, equipped] of Object.entries(player.equipped)) {
          if (equipped?.id === action.cardId) {
            card = equipped;
            const newEquipped = { ...player.equipped, [slot]: null };
            const player2 = recomputePower({ ...player, equipped: newEquipped });
            newHand = player2.hand;
            fromEquipped = true;
            break;
          }
        }
      }

      if (!card || !card.itemValue) return state;

      const goldGained = card.itemValue;
      const newGold = player.gold + goldGained;
      const levelFromGold = Math.floor(newGold / GOLD_PER_LEVEL);
      const remainderGold = newGold % GOLD_PER_LEVEL;

      // Cannot win by selling (max sell = level 9 + 1)
      const newLevel = Math.min(
        state.settings?.maxLevel ?? MAX_LEVEL - 1,
        player.level + levelFromGold,
      );

      const updatedPlayer = recomputePower({
        ...player,
        hand: fromEquipped ? newHand : newHand,
        gold: remainderGold,
        level: newLevel,
        hasSoldThisTurn: true,
      });

      return addEvent(
        { ...state, players: { ...state.players, [playerId]: updatedPlayer } },
        {
          type: 'SELL_ITEM',
          playerId,
          playerName: player.name,
          text: `${player.name} sold ${card.name} for ${goldGained} gold (+${levelFromGold} levels).`,
        },
      );
    }

    // ── DISCARD_CARD ─────────────────────────────────────────────────────────────
    case 'DISCARD_CARD': {
      if (!player) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card) return state;
      const newHand = player.hand.filter((c) => c.id !== action.cardId);
      const updatedPlayer = { ...player, hand: newHand };
      const isItem = card.type === 'TREASURE';
      return {
        ...state,
        players: { ...state.players, [playerId]: updatedPlayer },
        discardDoor: isItem ? state.discardDoor : discardCard(card, state.discardDoor),
        discardTreasure: isItem ? discardCard(card, state.discardTreasure) : state.discardTreasure,
      };
    }

    // ── CHARITY_GIVE ─────────────────────────────────────────────────────────────
    case 'CHARITY_GIVE': {
      if (state.phase !== 'CHARITY') return state;
      if (!player) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card) return state;
      const recipient = state.players[action.toPlayerId];
      if (!recipient) return state;

      const newHand = player.hand.filter((c) => c.id !== action.cardId);
      const recipientHand = [...recipient.hand, card];

      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...player, hand: newHand },
          [action.toPlayerId]: { ...recipient, hand: recipientHand },
        },
      };
    }

    // ── CHARITY_DONE ─────────────────────────────────────────────────────────────
    case 'CHARITY_DONE': {
      if (state.phase !== 'CHARITY') return state;
      if (playerId !== state.activePlayerId) return state;
      if (!player) return state;
      // Discard excess
      if (player.hand.length > MAX_HAND_SIZE) return state;
      return { ...state, phase: 'TURN_END' };
    }

    // ── PARTY_VOTE_CAST ───────────────────────────────────────────────────────────
    case 'PARTY_VOTE_CAST': {
      if (state.phase !== 'PARTY_VOTE' || !state.partyVote) return state;
      const updatedVotes = { ...state.partyVote.votes, [playerId]: action.vote };
      const voteCount = Object.values(updatedVotes).filter(Boolean).length;
      const totalPlayers = Object.keys(state.players).length;

      if (voteCount >= Math.ceil(totalPlayers / 2)) {
        return {
          ...state,
          partyVote: { ...state.partyVote, votes: updatedVotes, resolved: true },
          phase: 'DOOR_DRAW',
        };
      }
      return { ...state, partyVote: { ...state.partyVote, votes: updatedVotes } };
    }

    // ── MINIGAME_ANSWER ───────────────────────────────────────────────────────────
    case 'MINIGAME_ANSWER': {
      if (state.phase !== 'MINIGAME' || !state.minigame) return state;
      if (state.minigame.winnerId) return state; // already won

      const correct = action.answer === state.minigame.answer;
      if (!correct) {
        // Wrong answer = curse
        return addEvent(
          { ...state, minigame: { ...state.minigame, winnerId: 'none' }, phase: 'DOOR_DRAW' },
          { type: 'MINIGAME_FAIL', playerId, playerName: player?.name, text: `${player?.name ?? playerId} got the minigame wrong!` },
        );
      }

      if (!player) return state;
      // Winner: +1 Treasure
      const dealt = dealToHand(player.hand, state.treasureDeck, state.discardTreasure, 1, rng);
      const updatedPlayer = { ...player, hand: dealt.hand };
      return addEvent(
        {
          ...state,
          players: { ...state.players, [playerId]: updatedPlayer },
          treasureDeck: dealt.deck,
          discardTreasure: dealt.discard,
          minigame: { ...state.minigame, winnerId: playerId },
          phase: 'DOOR_DRAW',
        },
        { type: 'MINIGAME_WIN', playerId, playerName: player.name, text: `${player.name} won the minigame! +1 Treasure.` },
      );
    }

    // ── BOSS_RAID_FIGHT ───────────────────────────────────────────────────────────
    case 'BOSS_RAID_FIGHT': {
      if (state.phase !== 'BOSS_RAID' || !state.bossCard) return state;
      // All players fight together; combined power vs boss level
      const allPlayerIds = Object.keys(state.players);
      const totalPower = allPlayerIds.reduce((sum, pid) => sum + (state.players[pid]?.power ?? 0), 0);
      const bossLevel = state.bossCard.level ?? 15;

      if (totalPower > bossLevel) {
        // Win: all gain 1 level
        let players = { ...state.players };
        for (const pid of allPlayerIds) {
          const p = players[pid];
          if (p) {
            players = { ...players, [pid]: { ...p, level: Math.min(MAX_LEVEL, p.level + 1) } };
          }
        }
        return addEvent(
          { ...state, players, bossRaidActive: false, bossCard: null, phase: 'DOOR_DRAW' },
          { type: 'BOSS_WIN', text: `Party defeated ${state.bossCard.name}! All players gain 1 level!` },
        );
      } else {
        // Lose: all lose 1 level
        let players = { ...state.players };
        for (const pid of allPlayerIds) {
          const p = players[pid];
          if (p) {
            players = { ...players, [pid]: { ...p, level: Math.max(1, p.level - 1) } };
          }
        }
        return addEvent(
          { ...state, players, bossRaidActive: false, bossCard: null, phase: 'DOOR_DRAW' },
          { type: 'BOSS_LOSE', text: `Party failed to defeat ${state.bossCard.name}! All players lose 1 level.` },
        );
      }
    }

    // ── BOSS_RAID_FLEE ───────────────────────────────────────────────────────────
    case 'BOSS_RAID_FLEE': {
      if (state.phase !== 'BOSS_RAID') return state;
      return { ...state, bossRaidActive: false, bossCard: null, phase: 'DOOR_DRAW' };
    }

    // ── AUCTION ───────────────────────────────────────────────────────────────────
    case 'START_AUCTION': {
      if (!player) return state;
      if (player.hasSoldThisTurn) return state;
      const card = player.hand.find((c) => c.id === action.cardId);
      if (!card) return state;
      return {
        ...state,
        phase: 'AUCTION',
        auction: {
          item: card,
          sellerPlayerId: playerId,
          highestBid: 0,
          highestBidderId: null,
          bidsReceived: {},
          roundsLeft: 2,
        },
      };
    }

    case 'AUCTION_BID': {
      if (state.phase !== 'AUCTION' || !state.auction) return state;
      if (!player || player.gold < action.amount) return state;
      if (action.amount <= state.auction.highestBid) return state;
      return {
        ...state,
        auction: {
          ...state.auction,
          highestBid: action.amount,
          highestBidderId: playerId,
          bidsReceived: { ...state.auction.bidsReceived, [playerId]: action.amount },
        },
      };
    }

    case 'AUCTION_PASS': {
      if (state.phase !== 'AUCTION' || !state.auction) return state;
      const allPassed =
        Object.keys(state.players).filter((pid) => pid !== state.auction!.sellerPlayerId).length ===
        Object.keys(state.auction.bidsReceived).length + 1;
      if (allPassed) {
        return { ...state, phase: 'TURN_END', auction: null };
      }
      return state;
    }

    case 'AUCTION_CLOSE': {
      if (state.phase !== 'AUCTION' || !state.auction) return state;
      const { auction } = state;
      if (!auction.highestBidderId) {
        // No bids; return to seller's hand
        return { ...state, phase: 'TURN_END', auction: null };
      }
      // Transfer item and gold
      const seller = state.players[auction.sellerPlayerId];
      const buyer = state.players[auction.highestBidderId];
      if (!seller || !buyer) return state;
      const soldItem = auction.item;
      const sellerNewHand = seller.hand.filter((c) => c.id !== soldItem.id);
      const buyerNewHand = [...buyer.hand, soldItem];
      return {
        ...state,
        players: {
          ...state.players,
          [auction.sellerPlayerId]: { ...seller, hand: sellerNewHand, gold: seller.gold + auction.highestBid, hasSoldThisTurn: true },
          [auction.highestBidderId]: { ...buyer, hand: buyerNewHand, gold: buyer.gold - auction.highestBid },
        },
        phase: 'TURN_END',
        auction: null,
      };
    }

    // ── ALLY ────────────────────────────────────────────────────────────────────
    case 'ALLY_REQUEST': {
      if (!player) return state;
      return addEvent(state, {
        type: 'ALLY_REQUEST',
        playerId,
        playerName: player.name,
        text: `${player.name} requested an alliance with ${state.players[action.targetPlayerId]?.name ?? action.targetPlayerId}.`,
      });
    }

    case 'ALLY_ACCEPT': {
      if (!player) return state;
      const requester = state.players[action.fromPlayerId];
      if (!requester) return state;
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...player, allyId: action.fromPlayerId },
          [action.fromPlayerId]: { ...requester, allyId: playerId },
        },
      };
    }

    case 'ALLY_REJECT': {
      return state;
    }

    // ── USE_CLASS_ABILITY ─────────────────────────────────────────────────────────
    case 'USE_CLASS_ABILITY': {
      if (!player || player.hasUsedClassAbility) return state;
      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...player, hasUsedClassAbility: true },
        },
      };
    }

    // ── END_TURN ─────────────────────────────────────────────────────────────────
    case 'END_TURN': {
      if (state.phase !== 'TURN_END' && state.phase !== 'LOOT') return state;
      if (playerId !== state.activePlayerId) return state;
      return advanceTurn(state);
    }

    // ── FORCE_GAME_OVER ───────────────────────────────────────────────────────────
    case 'FORCE_GAME_OVER': {
      return { ...state, phase: 'GAME_OVER', finishedAt: Date.now() };
    }

    // ── ROLL_DICE (Door Event phase) ──────────────────────────────────────────────
    case 'ROLL_DICE': {
      if (state.phase !== 'DOOR_EVENT' || !state.diceRollState) return state;
      if (playerId !== state.activePlayerId) return state;
      if (state.diceRollState.rollResult) return state; // already rolled

      const { config } = state.diceRollState;
      const rollResult = Array.from({ length: config.diceCount }, () =>
        Math.floor(rng() * 6) + 1,
      );
      const totalRoll = rollResult.reduce((a, b) => a + b, 0);

      // Find the matching tier
      const tiers = [...config.tiers].sort((a, b) => b.minRoll - a.minRoll);
      const resolvedTier =
        tiers.find((t) => totalRoll >= t.minRoll && (t.maxRoll === null || totalRoll <= t.maxRoll)) ??
        tiers[tiers.length - 1];

      return addEvent(
        {
          ...state,
          diceRollState: {
            ...state.diceRollState,
            rollResult,
            totalRoll,
            resolvedTier,
          },
        },
        {
          type: 'DICE_ROLLED',
          playerId,
          playerName: player?.name,
          text: `${player?.name ?? playerId} rolled ${config.diceCount}${config.diceType}: [${rollResult.join(', ')}] = ${totalRoll} — ${resolvedTier?.label ?? '?'}`,
          animationTrigger: resolvedTier?.animationType === 'celebrate'
            ? { type: 'combat_win', targetPlayerId: playerId }
            : resolvedTier?.animationType === 'death' || resolvedTier?.animationType === 'curse'
              ? { type: 'curse', targetPlayerId: playerId }
              : undefined,
        },
      );
    }

    // ── RESOLVE_DOOR_EVENT ────────────────────────────────────────────────────────
    case 'RESOLVE_DOOR_EVENT': {
      if (state.phase !== 'DOOR_EVENT' || !state.diceRollState) return state;
      if (playerId !== state.activePlayerId) return state;

      const { resolvedTier } = state.diceRollState;
      if (!resolvedTier) return state;

      // Apply effects
      let newState: MunchkinGameState = { ...state };

      for (const effect of resolvedTier.effects) {
        newState = applyDiceEffect(newState, effect, playerId, rng);
      }

      // Check win condition
      const activePlayer = newState.players[playerId];
      const maxLevel = newState.settings.maxLevel;
      if (activePlayer && activePlayer.level >= maxLevel) {
        return {
          ...newState,
          diceRollState: { ...newState.diceRollState!, resolved: true },
          phase: 'GAME_OVER',
          winnerId: playerId,
          finishedAt: Date.now(),
        };
      }

      return addEvent(
        {
          ...newState,
          diceRollState: { ...newState.diceRollState!, resolved: true },
          phase: 'LOOT',
        },
        {
          type: 'DOOR_EVENT_RESOLVED',
          playerId,
          playerName: player?.name,
          text: `Door event resolved: ${resolvedTier.description}`,
        },
      );
    }

    default:
      return state;
  }
}

// ── Apply a single DiceOutcomeEffect to game state ────────────────────────────

function applyDiceEffect(
  state: MunchkinGameState,
  effect: DiceOutcomeEffect,
  activePlayerId: string,
  rng: () => number,
): MunchkinGameState {
  const targetIds =
    effect.target === 'all'
      ? Object.keys(state.players)
      : effect.target === 'left'
        ? [getAdjacentPlayer(state, activePlayerId, -1)]
        : effect.target === 'right'
          ? [getAdjacentPlayer(state, activePlayerId, 1)]
          : [activePlayerId];

  let newState = { ...state };

  for (const pid of targetIds) {
    const p = newState.players[pid];
    if (!p) continue;

    switch (effect.type) {
      case 'gain_level': {
        const newLevel = Math.min(newState.settings.maxLevel, p.level + (effect.amount ?? 1));
        newState = { ...newState, players: { ...newState.players, [pid]: { ...p, level: newLevel } } };
        break;
      }
      case 'lose_level': {
        const newLevel = Math.max(1, p.level - (effect.amount ?? 1));
        newState = { ...newState, players: { ...newState.players, [pid]: { ...p, level: newLevel } } };
        break;
      }
      case 'gain_gold': {
        newState = { ...newState, players: { ...newState.players, [pid]: { ...p, gold: p.gold + (effect.amount ?? 100) } } };
        break;
      }
      case 'lose_gold': {
        newState = { ...newState, players: { ...newState.players, [pid]: { ...p, gold: Math.max(0, p.gold - (effect.amount ?? 100)) } } };
        break;
      }
      case 'draw_treasure': {
        const dealt = dealToHand(p.hand, newState.treasureDeck, newState.discardTreasure, effect.amount ?? 1, rng);
        newState = {
          ...newState,
          players: { ...newState.players, [pid]: { ...p, hand: dealt.hand } },
          treasureDeck: dealt.deck,
          discardTreasure: dealt.discard,
        };
        break;
      }
      case 'draw_door': {
        const dealt = dealToHand(p.hand, newState.doorDeck, newState.discardDoor, effect.amount ?? 1, rng);
        newState = {
          ...newState,
          players: { ...newState.players, [pid]: { ...p, hand: dealt.hand } },
          doorDeck: dealt.deck,
          discardDoor: dealt.discard,
        };
        break;
      }
      case 'discard_item': {
        const equippedSlots = Object.entries(p.equipped).filter(([, v]) => v !== null);
        if (equippedSlots.length > 0) {
          const randomSlot = equippedSlots[Math.floor(rng() * equippedSlots.length)][0];
          newState = {
            ...newState,
            players: { ...newState.players, [pid]: { ...p, equipped: { ...p.equipped, [randomSlot]: null } } },
          };
        }
        break;
      }
      case 'skip_turn': {
        // Handled by checking if p.hasSoldThisTurn (hack) — ideally would store skip list
        // For simplicity we log it; the full skip mechanic can be tracked via a future state field
        break;
      }
    }
  }

  return newState;
}

function getAdjacentPlayer(
  state: MunchkinGameState,
  playerId: string,
  direction: 1 | -1,
): string {
  const idx = state.turnOrder.indexOf(playerId);
  const nextIdx = (idx + direction + state.turnOrder.length) % state.turnOrder.length;
  return state.turnOrder[nextIdx];
}
