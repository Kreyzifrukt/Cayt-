import { describe, expect, it } from "vitest";
import { has2048Moves, merge2048Line, move2048 } from "./puzzleLogic";

describe("2048 movement rules", () => {
  it("merges each pair only once in a move", () => {
    expect(merge2048Line([2, 2, 2, 2])).toEqual({ line: [4, 4, 0, 0], score: 8 });
    expect(merge2048Line([2, 0, 2, 0])).toEqual({ line: [4, 0, 0, 0], score: 4 });
  });

  it("moves tiles in all four directions and reports gained score", () => {
    const board = [
      2, 2, 0, 0,
      0, 4, 0, 0,
      2, 0, 0, 0,
      0, 0, 0, 0,
    ];
    expect(move2048(board, "left")).toEqual({
      board: [4, 0, 0, 0, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      score: 4,
      changed: true,
    });
    expect(move2048(board, "right").changed).toBe(true);
    expect(move2048(board, "up").changed).toBe(true);
    expect(move2048(board, "down").changed).toBe(true);
  });

  it("does not report a no-op as a move", () => {
    const board = [2, 4, 8, 16, 4, 8, 16, 2, 8, 16, 2, 4, 16, 2, 4, 8];
    expect(move2048(board, "left").changed).toBe(false);
  });

  it("detects empty cells and adjacent equal tiles as legal continuation", () => {
    expect(has2048Moves([2, 4, 8, 16, 4, 8, 16, 2, 8, 16, 2, 4, 16, 2, 4, 0])).toBe(true);
    expect(has2048Moves([2, 4, 8, 16, 4, 8, 16, 2, 8, 16, 2, 4, 16, 2, 4, 8])).toBe(false);
    expect(has2048Moves([2, 4, 8, 16, 4, 8, 16, 2, 8, 16, 2, 4, 16, 2, 8, 4])).toBe(true);
  });
});
