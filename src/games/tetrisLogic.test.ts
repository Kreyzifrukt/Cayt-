import { describe, expect, it } from "vitest";
import { canPlaceTetromino, getTetrominoBlocks, rotateTetromino, TETROMINOES } from "./tetrisLogic";

describe("Tetris rules", () => {
  it("provides seven distinct four-block tetrominoes", () => {
    expect(TETROMINOES).toHaveLength(7);
    for (const shape of TETROMINOES) {
      expect(shape).toHaveLength(16);
      expect(shape.reduce((sum, cell) => sum + cell, 0)).toBe(4);
    }
    expect(new Set(TETROMINOES.map(shape => shape.join(""))).size).toBe(7);
  });

  it("rotates a horizontal I piece into a vertical piece without losing blocks", () => {
    const rotated = rotateTetromino(TETROMINOES[0]);
    expect(rotated.reduce((sum, cell) => sum + cell, 0)).toBe(4);
    expect(getTetrominoBlocks(TETROMINOES[0], 0, 0)).toHaveLength(4);
    expect(rotated.filter(Boolean)).toHaveLength(4);
    expect(rotated[2]).toBe(1);
    expect(rotated[6]).toBe(1);
    expect(rotated[10]).toBe(1);
    expect(rotated[14]).toBe(1);
  });

  it("rejects placements outside the board and on occupied cells", () => {
    const board = Array.from({ length: 16 }, () => Array(10).fill(0));
    expect(canPlaceTetromino(board, TETROMINOES[0], 3, 0)).toBe(true);
    expect(canPlaceTetromino(board, TETROMINOES[0], -1, 0)).toBe(false);
    expect(canPlaceTetromino(board, TETROMINOES[0], 3, 15)).toBe(false);
    board[1][4] = 1;
    expect(canPlaceTetromino(board, TETROMINOES[0], 3, 0)).toBe(false);
  });
});
