import { describe, expect, it } from "vitest";
import { createGemBoard, ensurePlayableGemBoard, findGemMatches, hasPossibleGemMove, resolveGemCascades } from "./matchThreeLogic";

describe("Gem Match logic", () => {
  it("generates a board without automatic matches", () => {
    const board = createGemBoard(() => 0.42);
    expect(board).toHaveLength(7);
    expect(board.every((row) => row.length === 7)).toBe(true);
    expect(findGemMatches(board).size).toBe(0);
    expect(hasPossibleGemMove(board)).toBe(true);
  });

  it("provides a playable fallback when the random generator repeats a fixed value", () => {
    const board = createGemBoard(() => 0.42);
    expect(findGemMatches(board).size).toBe(0);
    expect(hasPossibleGemMove(board)).toBe(true);
  });

  it("finds horizontal and vertical runs without double-counting intersections", () => {
    const board = Array.from({ length: 7 }, () => Array(7).fill(4));
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 7; column += 1) board[row][column] = (row + column) % 5;
    }
    board[2][1] = 3;
    board[2][2] = 3;
    board[2][3] = 3;
    board[1][2] = 3;
    board[3][2] = 3;
    const matches = findGemMatches(board);
    expect(matches).toEqual(new Set([9, 15, 16, 17, 23]));
  });

  it("clears matches, applies gravity, and scores cascades", () => {
    const board = Array.from({ length: 7 }, (_, row) =>
      Array.from({ length: 7 }, (_, column) => (row + column) % 5),
    );
    board[6][0] = 2;
    board[6][1] = 2;
    board[6][2] = 2;
    let seed = 0;
    const result = resolveGemCascades(board, () => ((seed++ % 5) + 0.1) / 5);
    expect(result.cleared).toBeGreaterThanOrEqual(3);
    expect(result.cascades).toBeGreaterThanOrEqual(1);
    expect(result.board.flat().every((gem) => gem >= 0 && gem < 5)).toBe(true);
  });
});


  it("replaces a dead board after a refill leaves no legal swaps", () => {
    const deadBoard = Array.from({ length: 7 }, (_, row) =>
      Array.from({ length: 7 }, (_, column) => (row + column) % 5),
    );

    expect(findGemMatches(deadBoard).size).toBe(0);
    expect(hasPossibleGemMove(deadBoard)).toBe(false);

    const playable = ensurePlayableGemBoard(deadBoard, () => 0.42);

    expect(playable).not.toBe(deadBoard);
    expect(findGemMatches(playable).size).toBe(0);
    expect(hasPossibleGemMove(playable)).toBe(true);
  });
