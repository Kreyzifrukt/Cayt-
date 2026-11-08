import { describe, expect, it } from "vitest";
import { revealSafeCells } from "./minesweeperLogic";

describe("Minesweeper flood reveal", () => {
  it("does not reveal flagged cells during automatic expansion", () => {
    const revealed = revealSafeCells(
      0,
      new Set(),
      new Set([1, 9]),
      new Set([63]),
    );

    expect(revealed.has(0)).toBe(true);
    expect(revealed.has(1)).toBe(false);
    expect(revealed.has(9)).toBe(false);
  });

  it("does not reveal mines during automatic expansion", () => {
    const revealed = revealSafeCells(0, new Set(), new Set(), new Set([63]));

    expect(revealed.has(63)).toBe(false);
    expect(revealed.size).toBe(63);
  });

  it("preserves cells that were already open", () => {
    const revealed = revealSafeCells(
      10,
      new Set([5]),
      new Set(),
      new Set([63]),
    );

    expect(revealed.has(5)).toBe(true);
    expect(revealed.has(10)).toBe(true);
  });
});
