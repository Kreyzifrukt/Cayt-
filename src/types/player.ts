import type { GameId } from "./game";

export type Language = "en" | "uk";

export interface Save {
  language: Language;
  xp: number;
  coins: number;
  played: number;
  wins: number;
  best: Partial<Record<GameId, number>>;
  favorites: GameId[];
  sound: boolean;
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
  xp: 0, coins: 0, played: 0, wins: 0, best: {}, favorites: [],
  sound: true, profileName: "PLAYER ONE", theme: "neon", skin: "mint", unlockedSkins: ["mint"],
  dailyDate: "", dailyRuns: 0, dailyClaimed: false,
};
