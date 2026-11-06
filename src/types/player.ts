import type { GameId } from "./game";

export type Language = "en" | "uk";

export interface GameStatistics {
  played: number;
  wins: number;
  draws: number;
  totalDurationSeconds: number;
  bestScore: number;
}

export interface GameSession {
  id: GameId;
  playedAt: string;
  durationSeconds: number;
  score: number;
  won: boolean;
  draw: boolean;
}

export interface Save {
  language: Language;
  xp: number;
  coins: number;
  played: number;
  wins: number;
  draws: number;
  best: Partial<Record<GameId, number>>;
  gameStats: Partial<Record<GameId, GameStatistics>>;
  history: GameSession[];
  favorites: GameId[];
  sound: boolean;
  effectsVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  profileName: string;
  theme: "neon" | "light";
  skin: "mint" | "violet" | "ember" | "ice";
  unlockedSkins: string[];
  dailyDate: string;
  dailyRuns: number;
  dailyClaimed: boolean;
}

export const DEFAULT_SAVE: Save = {
  language: "uk",
  xp: 0, coins: 0, played: 0, wins: 0, draws: 0, best: {}, gameStats: {}, history: [], favorites: [],
  sound: true, effectsVolume: 0.65, musicEnabled: false, musicVolume: 0.18, profileName: "PLAYER ONE", theme: "neon", skin: "mint", unlockedSkins: ["mint"],
  dailyDate: "", dailyRuns: 0, dailyClaimed: false,
};
