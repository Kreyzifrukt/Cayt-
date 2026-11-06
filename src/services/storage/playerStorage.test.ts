import { describe, expect, it } from "vitest";
import { GAME_IDS, normalizeSave } from "./playerStorage";
import { randomDifferentIndex } from "../../games/gameUtils";

describe("player save normalization", () => {
  it("keeps progress from the previous eight-game save format", () => {
    const save = normalizeSave({ xp: 420, played: 12, wins: 4, best: { snake: 90, "word-scramble": 150 }, favorites: ["snake"], sound: false });
    expect(save.xp).toBe(420);
    expect(save.played).toBe(12);
    expect(save.best.snake).toBe(90);
    expect(save.best["word-scramble"]).toBe(150);
    expect(save.sound).toBe(false);
    expect(save.theme).toBe("neon");
    expect(save.skin).toBe("mint");
    expect(save.unlockedSkins).toEqual(["mint"]);
    expect(save.profileName).toBe("PLAYER ONE");
    expect(save.language).toBe("uk");
  });

  it("restores a valid saved language and falls back safely for unknown values", () => {
    expect(normalizeSave({ language: "en" }).language).toBe("en");
    expect(normalizeSave({ language: "fr" }).language).toBe("uk");
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

  it("restores only unlocked cosmetic palettes", () => {
    const save = normalizeSave({ skin: "ember", unlockedSkins: ["mint", "ember", "invalid"] });
    expect(save.skin).toBe("ember");
    expect(save.unlockedSkins).toEqual(["mint", "ember"]);
  });

  it("migrates old saves without inventing per-game history", () => {
    const save = normalizeSave({ played: 18, wins: 7, best: { snake: 90 } });
    expect(save.played).toBe(18);
    expect(save.wins).toBe(7);
    expect(save.gameStats).toEqual({});
    expect(save.history).toEqual([]);
  });

  it("validates game statistics and recent session history", () => {
    const save = normalizeSave({
      gameStats: {
        snake: { played: 5, wins: 3, totalDurationSeconds: 240, bestScore: 90 },
        tetris: { played: -2, wins: 10, totalDurationSeconds: -1, bestScore: "bad" },
        unknown: { played: 100, wins: 100 },
      },
      history: [
        { id: "snake", playedAt: "2026-11-06T10:00:00.000Z", durationSeconds: 30, score: 90, won: true },
        { id: "unknown", playedAt: "2026-11-06T10:00:00.000Z", durationSeconds: 30, score: 90, won: true },
        { id: "2048", playedAt: "not-a-date", durationSeconds: 30, score: 90, won: false },
      ],
    });
    expect(save.gameStats.snake).toEqual({ played: 5, wins: 3, totalDurationSeconds: 240, bestScore: 90 });
    expect(save.gameStats.tetris).toEqual({ played: 0, wins: 0, totalDurationSeconds: 0, bestScore: 0 });
    expect(save.history).toHaveLength(1);
    expect(save.history[0].id).toBe("snake");
  });

  it("clamps and restores the effects volume setting", () => {
    expect(normalizeSave({ effectsVolume: 0.35 }).effectsVolume).toBe(0.35);
    expect(normalizeSave({ effectsVolume: 8 }).effectsVolume).toBe(1);
    expect(normalizeSave({ effectsVolume: -2 }).effectsVolume).toBe(0);
    expect(normalizeSave({ effectsVolume: "loud" }).effectsVolume).toBe(0.65);
  });

  it("normalizes music enabled state and music volume", () => {
    expect(normalizeSave({ musicEnabled: true, musicVolume: 0.4 }).musicEnabled).toBe(true);
    expect(normalizeSave({ musicEnabled: true, musicVolume: 4 }).musicVolume).toBe(1);
    expect(normalizeSave({ musicEnabled: false, musicVolume: -1 }).musicVolume).toBe(0);
    expect(normalizeSave({ musicEnabled: "yes", musicVolume: "loud" }).musicEnabled).toBe(false);
    expect(normalizeSave({ musicEnabled: "yes", musicVolume: "loud" }).musicVolume).toBe(0.18);
  });

  it("chooses a different valid target for Whack-a-Mole", () => {
    for (let current = 0; current < 9; current += 1) {
      const next = randomDifferentIndex(current, 9, () => 0.5);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(9);
      expect(next).not.toBe(current);
    }
    expect(randomDifferentIndex(0, 1, () => 0.5)).toBe(0);
  });

  it("registers exactly 31 games", () => {
    expect(GAME_IDS).toHaveLength(31);
    expect(new Set(GAME_IDS).size).toBe(31);
  });
});
