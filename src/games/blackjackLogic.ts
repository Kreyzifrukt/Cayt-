export type Card = {
  rank: number;
  suit: string;
};

const SUITS = ["♠", "♥", "♦", "♣"] as const;

export function createShuffledDeck(random = Math.random): Card[] {
  const deck = Array.from({ length: 52 }, (_, index) => ({
    rank: (index % 13) + 1,
    suit: SUITS[Math.floor(index / 13)],
  }));

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck;
}

export function handValue(cards: readonly Card[]): number {
  let total = cards.reduce(
    (sum, card) => sum + (card.rank > 10 ? 10 : card.rank === 1 ? 11 : card.rank),
    0,
  );
  let aces = cards.filter((card) => card.rank === 1).length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}
