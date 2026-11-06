import { DEFAULT_SAVE, type Save } from "../../types/player";
import type { GameId } from "../../types/game";

export const STORAGE_KEY = "neon-arcade-save";
export const GAME_IDS: GameId[] = [
  "snake", "2048", "memory", "xo", "reflex", "lights-out", "tap-blitz", "word-scramble",
  "minesweeper", "tetris", "breakout", "pong", "simon", "hangman", "connect-four",
  "whack-a-mole", "math-sprint", "color-clash", "pattern-recall", "higher-lower",
  "typing-rush", "number-hunt", "mini-sudoku",
];
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}
export function normalizeSave(value: unknown): Save {
  if (!isRecord(value)) return { ...DEFAULT_SAVE };
  const best: Save["best"] = {};
  if (isRecord(value.best)) for (const id of GAME_IDS) {
    const score = value.best[id];
    if (typeof score === "number" && Number.isFinite(score) && score >= 0) best[id] = score;
  }
  const validSkins = ["mint", "violet", "ember", "ice"] as const;
  const unlockedSkins = Array.isArray(value.unlockedSkins)
    ? [...new Set(value.unlockedSkins.filter((skin): skin is string => typeof skin === "string" && validSkins.includes(skin as typeof validSkins[number])))]
    : ["mint"];
  if (!unlockedSkins.includes("mint")) unlockedSkins.unshift("mint");
  const favorites = Array.isArray(value.favorites)
    ? [...new Set(value.favorites.filter((id): id is GameId => typeof id === "string" && GAME_IDS.includes(id as GameId)))]
    : [];
  return {
    xp: readNumber(value.xp, 0), coins: readNumber(value.coins, 0),
    played: readNumber(value.played, 0), wins: readNumber(value.wins, 0),
    best, favorites, sound: typeof value.sound === "boolean" ? value.sound : true,
    profileName: typeof value.profileName === "string" ? value.profileName.slice(0, 20) : DEFAULT_SAVE.profileName,
    theme: value.theme === "light" ? "light" : "neon",
    skin: validSkins.includes(value.skin as typeof validSkins[number]) && unlockedSkins.includes(value.skin as string) ? value.skin as Save["skin"] : "mint",
    unlockedSkins,
    dailyDate: typeof value.dailyDate === "string" ? value.dailyDate : "",
    dailyRuns: readNumber(value.dailyRuns, 0),
    dailyClaimed: typeof value.dailyClaimed === "boolean" ? value.dailyClaimed : false,
  };
}
export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSave(JSON.parse(raw)) : { ...DEFAULT_SAVE };
  } catch { return { ...DEFAULT_SAVE }; }
}
export function persistSave(save: Save): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }
  catch { /* Storage may be unavailable or full; gameplay remains usable. */ }
}
