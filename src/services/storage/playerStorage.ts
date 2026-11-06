import { DEFAULT_SAVE, type Save } from "../../types/player";
import type { GameId } from "../../types/game";

const STORAGE_KEY = "neon-arcade-save";
const GAME_IDS: GameId[] = ["snake", "2048", "memory", "xo", "reflex", "lights-out", "tap-blitz", "word-scramble"];

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function readNumber(value: unknown, fallback: number): number { return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback; }

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return DEFAULT_SAVE;
    const best: Save["best"] = {};
    if (isRecord(parsed.best)) for (const id of GAME_IDS) { const score = parsed.best[id]; if (typeof score === "number" && Number.isFinite(score) && score >= 0) best[id] = score; }
    return { xp: readNumber(parsed.xp, 0), played: readNumber(parsed.played, 0), wins: readNumber(parsed.wins, 0), best, favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter((id): id is GameId => GAME_IDS.includes(id as GameId)) : [], sound: typeof parsed.sound === "boolean" ? parsed.sound : true };
  } catch { return DEFAULT_SAVE; }
}
export function persistSave(save: Save): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); } catch { /* Storage can be unavailable or full; gameplay should still work. */ } }
