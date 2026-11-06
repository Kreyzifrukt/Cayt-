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
export function normalizeSave(value: unknown): Save {
  if (!isRecord(value)) return { ...DEFAULT_SAVE };
  const best: Save["best"] = {};
  if (isRecord(value.best)) for (const id of GAME_IDS) {
    const score = value.best[id];
    if (typeof score === "number" && Number.isFinite(score) && score >= 0) best[id] = score;
  }
  const gameStats: Save["gameStats"] = {};
  if (isRecord(value.gameStats)) for (const id of GAME_IDS) {
    const raw = value.gameStats[id];
    if (!isRecord(raw)) continue;
    const played = readNumber(raw.played, 0);
    gameStats[id] = {
      played,
      wins: Math.min(played, readNumber(raw.wins, 0)),
      totalDurationSeconds: readNumber(raw.totalDurationSeconds, 0),
      bestScore: readNumber(raw.bestScore, 0),
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
        durationSeconds: readNumber(entry.durationSeconds, 0),
        score: readNumber(entry.score, 0),
        won: entry.won as boolean,
      }))
    : [];
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
    xp: readNumber(value.xp, 0), coins: readNumber(value.coins, 0),
    played: readNumber(value.played, 0), wins: readNumber(value.wins, 0),
    best, gameStats, history, favorites, sound: typeof value.sound === "boolean" ? value.sound : true,
    effectsVolume: typeof value.effectsVolume === "number" && Number.isFinite(value.effectsVolume) ? Math.max(0, Math.min(1, value.effectsVolume)) : DEFAULT_SAVE.effectsVolume,
    musicEnabled: typeof value.musicEnabled === "boolean" ? value.musicEnabled : DEFAULT_SAVE.musicEnabled,
    musicVolume: typeof value.musicVolume === "number" && Number.isFinite(value.musicVolume) ? Math.max(0, Math.min(1, value.musicVolume)) : DEFAULT_SAVE.musicVolume,
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
