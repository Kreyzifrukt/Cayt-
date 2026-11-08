import { DEFAULT_SAVE, type Save } from "../../types/player";
import type { GameId } from "../../types/game";

export const STORAGE_KEY = "neon-arcade-save";
export const MAX_SESSION_HISTORY = 500;
export const GAME_IDS: GameId[] = [
  "snake", "2048", "memory", "xo", "reflex", "lights-out", "tap-blitz", "word-scramble",
  "minesweeper", "tetris", "breakout", "pong", "simon", "hangman", "connect-four",
  "whack-a-mole", "math-sprint", "color-clash", "pattern-recall", "higher-lower",
  "typing-rush", "number-hunt", "mini-sudoku",
  "fifteen-puzzle", "sokoban", "reversi", "mastermind", "blackjack", "frogger", "match-three", "maze-runner",
];
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}
function readCount(value: unknown, fallback = 0): number {
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(readNumber(value, fallback)));
}
function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}
export function normalizeSave(value: unknown): Save {
  if (!isRecord(value)) return { ...DEFAULT_SAVE };
  const best: Save["best"] = {};
  if (isRecord(value.best)) for (const id of GAME_IDS) {
    const score = value.best[id];
    if (typeof score === "number" && Number.isFinite(score) && score >= 0) best[id] = readCount(score);
  }
  const gameStats: Save["gameStats"] = {};
  if (isRecord(value.gameStats)) for (const id of GAME_IDS) {
    const raw = value.gameStats[id];
    if (!isRecord(raw)) continue;
    const played = readCount(raw.played);
    gameStats[id] = {
      played,
      wins: Math.min(played, readCount(raw.wins)),
      draws: Math.min(Math.max(0, played - readCount(raw.wins)), readCount(raw.draws)),
      totalDurationSeconds: readCount(raw.totalDurationSeconds),
      bestScore: readCount(raw.bestScore),
    };
  }
  const history: Save["history"] = Array.isArray(value.history)
    ? value.history.filter((entry): entry is Record<string, unknown> =>
        isRecord(entry) &&
        typeof entry.id === "string" && GAME_IDS.includes(entry.id as GameId) &&
        typeof entry.playedAt === "string" && Number.isFinite(Date.parse(entry.playedAt)) &&
        typeof entry.won === "boolean"
      ).slice(0, MAX_SESSION_HISTORY).map(entry => ({
        id: entry.id as GameId,
        playedAt: entry.playedAt as string,
        durationSeconds: readCount(entry.durationSeconds),
        score: readCount(entry.score),
        won: entry.won === true && entry.draw !== true,
        draw: entry.draw === true,
      }))
    : [];
  const played = readCount(value.played);
  const wins = Math.min(played, readCount(value.wins));
  const draws = Math.min(Math.max(0, played - wins), readCount(value.draws));
  const validSkins = ["mint", "violet", "ember", "ice"] as const;
  const unlockedSkins = Array.isArray(value.unlockedSkins)
    ? [...new Set(value.unlockedSkins.filter((skin): skin is string => typeof skin === "string" && validSkins.includes(skin as typeof validSkins[number])))]
    : ["mint"];
  if (!unlockedSkins.includes("mint")) unlockedSkins.unshift("mint");
  const favorites = Array.isArray(value.favorites)
    ? [...new Set(value.favorites.filter((id): id is GameId => typeof id === "string" && GAME_IDS.includes(id as GameId)))]
    : [];
  return {
    language: value.language === "en" ? "en" : "uk",
    xp: readCount(value.xp), coins: readCount(value.coins),
    played, wins, draws,
    best, gameStats, history, favorites, sound: typeof value.sound === "boolean" ? value.sound : true,
    effectsVolume: typeof value.effectsVolume === "number" && Number.isFinite(value.effectsVolume) ? Math.max(0, Math.min(1, value.effectsVolume)) : DEFAULT_SAVE.effectsVolume,
    musicEnabled: typeof value.musicEnabled === "boolean" ? value.musicEnabled : DEFAULT_SAVE.musicEnabled,
    musicVolume: typeof value.musicVolume === "number" && Number.isFinite(value.musicVolume) ? Math.max(0, Math.min(1, value.musicVolume)) : DEFAULT_SAVE.musicVolume,
    profileName: typeof value.profileName === "string" && value.profileName.trim() ? value.profileName.trim().slice(0, 20) : DEFAULT_SAVE.profileName,
    theme: value.theme === "light" ? "light" : "neon",
    skin: validSkins.includes(value.skin as typeof validSkins[number]) && unlockedSkins.includes(value.skin as string) ? value.skin as Save["skin"] : "mint",
    unlockedSkins,
    dailyDate: isDateKey(value.dailyDate) ? value.dailyDate : "",
    dailyRuns: Math.min(3, readCount(value.dailyRuns)),
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
