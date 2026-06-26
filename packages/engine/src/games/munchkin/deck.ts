import type { MunchkinCard } from './types';

/** Fisher-Yates shuffle using injected RNG for determinism */
export function shuffleDeck(cards: MunchkinCard[], rng: () => number): MunchkinCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Draw the top card from a deck. Returns [card, remainingDeck]. */
export function drawCard(deck: MunchkinCard[]): [MunchkinCard | null, MunchkinCard[]] {
  if (deck.length === 0) return [null, deck];
  const [top, ...rest] = deck;
  return [top, rest];
}

/** Draw multiple cards at once. */
export function drawCards(
  deck: MunchkinCard[],
  count: number,
): [MunchkinCard[], MunchkinCard[]] {
  const drawn: MunchkinCard[] = [];
  let remaining = [...deck];
  for (let i = 0; i < count; i++) {
    const [card, next] = drawCard(remaining);
    if (!card) break;
    drawn.push(card);
    remaining = next;
  }
  return [drawn, remaining];
}

/** Add card to discard pile. */
export function discardCard(card: MunchkinCard, pile: MunchkinCard[]): MunchkinCard[] {
  return [...pile, card];
}

/** Reshuffle discard pile into an empty deck. */
export function reshuffleDiscard(
  discard: MunchkinCard[],
  rng: () => number,
): [MunchkinCard[], MunchkinCard[]] {
  const shuffled = shuffleDeck(discard, rng);
  return [shuffled, []];
}

/** Deal `count` cards from deck to hand. Auto-reshuffles from discard if needed. */
export function dealToHand(
  hand: MunchkinCard[],
  deck: MunchkinCard[],
  discard: MunchkinCard[],
  count: number,
  rng: () => number,
): { hand: MunchkinCard[]; deck: MunchkinCard[]; discard: MunchkinCard[] } {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  const newCards: MunchkinCard[] = [];

  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) {
      if (currentDiscard.length === 0) break;
      [currentDeck, currentDiscard] = reshuffleDiscard(currentDiscard, rng);
    }
    const [card, rest] = drawCard(currentDeck);
    if (!card) break;
    newCards.push(card);
    currentDeck = rest;
  }

  return {
    hand: [...hand, ...newCards],
    deck: currentDeck,
    discard: currentDiscard,
  };
}
