import { describe, expect, it } from "vitest";
import { createShuffledDeck, handValue } from "./blackjackLogic";

describe("Blackjack rules", () => {
  it("creates a complete 52-card deck without duplicates", () => {
    const deck = createShuffledDeck(() => 0.42);
    const identities = deck.map((card) => `${card.rank}-${card.suit}`);

    expect(deck).toHaveLength(52);
    expect(new Set(identities).size).toBe(52);
    expect(deck.every((card) => card.rank >= 1 && card.rank <= 13)).toBe(true);
  });

  it("downgrades aces from eleven to one only when needed", () => {
    expect(handValue([{ rank: 1, suit: "♠" }, { rank: 9, suit: "♥" }])).toBe(20);
    expect(handValue([
      { rank: 1, suit: "♠" },
      { rank: 9, suit: "♥" },
      { rank: 5, suit: "♦" },
    ])).toBe(15);
    expect(handValue([
      { rank: 1, suit: "♠" },
      { rank: 1, suit: "♥" },
      { rank: 9, suit: "♦" },
    ])).toBe(21);
  });

  it("counts face cards as ten", () => {
    expect(handValue([
      { rank: 11, suit: "♠" },
      { rank: 12, suit: "♥" },
      { rank: 13, suit: "♦" },
    ])).toBe(30);
  });
});
