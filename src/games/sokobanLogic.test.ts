import { describe, expect, it } from "vitest";
import {
  createSokobanLevel,
  isSokobanLevelSolvable,
  SOKOBAN_FALLBACK_LEVEL,
  SOKOBAN_SIZE,
} from "./sokobanLogic";

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1_664_525 + 1_013_904_223) >>> 0;
    return value / 0x1_0000_0000;
  };
}

describe("Sokoban level generation", () => {
  it("keeps the fallback level with interior walls solvable", () => {
    expect(SOKOBAN_FALLBACK_LEVEL.walls.length).toBeGreaterThan(0);
    expect(isSokobanLevelSolvable(SOKOBAN_FALLBACK_LEVEL)).toBe(true);
  });

  it("rejects a player trapped between two boxes and the boundary", () => {
    expect(isSokobanLevelSolvable({
      player: SOKOBAN_SIZE + 1,
      boxes: [SOKOBAN_SIZE + 2, SOKOBAN_SIZE + 3, 2 * SOKOBAN_SIZE + 1, 3 * SOKOBAN_SIZE + 1],
      goals: [SOKOBAN_SIZE + 4, 2 * SOKOBAN_SIZE + 3, 3 * SOKOBAN_SIZE + 2, 4 * SOKOBAN_SIZE + 3],
      walls: [],
    })).toBe(false);
  });

  it("generates solvable levels with interior walls across deterministic seeds", () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const level = createSokobanLevel(seededRandom(seed));
      expect(level.boxes).toHaveLength(3);
      expect(level.goals).toHaveLength(3);
      expect(level.walls.length).toBeGreaterThanOrEqual(3);
      expect(new Set(level.walls).size).toBe(level.walls.length);
      expect(new Set(level.boxes).size).toBe(3);
      expect(new Set(level.goals).size).toBe(3);
      expect(level.boxes.some((box) => level.goals.includes(box))).toBe(false);
      expect(level.boxes).not.toContain(level.player);
      expect(level.goals).not.toContain(level.player);
      expect(level.walls).not.toContain(level.player);
      expect(level.walls.some((wall) => level.boxes.includes(wall) || level.goals.includes(wall))).toBe(false);
      expect(isSokobanLevelSolvable(level)).toBe(true);
    }
  });
});
