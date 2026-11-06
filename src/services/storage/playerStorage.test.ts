import { describe, expect, it } from "vitest";
import { GAME_IDS, normalizeSave } from "./playerStorage";

describe("player save normalization", () => {
  it("keeps progress from the previous eight-game save format", () => {
    const save = normalizeSave({ xp: 420, played: 12, wins: 4, best: { snake: 90, "word-scramble": 150 }, favorites: ["snake"], sound: false });
    expect(save.xp).toBe(420);
    expect(save.played).toBe(12);
    expect(save.best.snake).toBe(90);
    expect(save.best["word-scramble"]).toBe(150);
    expect(save.sound).toBe(false);
    expect(save.theme).toBe("neon");
    expect(save.profileName).toBe("PLAYER ONE");
  });

  it("accepts only known game IDs and removes duplicate favorites", () => {
    const save = normalizeSave({ favorites: ["snake", "snake", "not-a-game", "tetris"], best: { snake: 10, invalid: 999 } });
    expect(save.favorites).toEqual(["snake", "tetris"]);
    expect(save.best).toEqual({ snake: 10 });
  });

  it("sanitizes malformed and negative values", () => {
    const save = normalizeSave({ xp: -100, played: "many", wins: NaN, coins: -2, profileName: "A".repeat(40), theme: "ultraviolet" });
    expect(save.xp).toBe(0);
    expect(save.played).toBe(0);
    expect(save.wins).toBe(0);
    expect(save.coins).toBe(0);
    expect(save.profileName).toHaveLength(20);
    expect(save.theme).toBe("neon");
  });

  it("registers exactly 23 games", () => {
    expect(GAME_IDS).toHaveLength(23);
    expect(new Set(GAME_IDS).size).toBe(23);
  });
});
