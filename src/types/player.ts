import type { GameId } from "./game";

export interface Save {
  xp: number;
  played: number;
  wins: number;
  best: Partial<Record<GameId, number>>;
  favorites: GameId[];
  sound: boolean;
}

export const DEFAULT_SAVE: Save = {
  xp: 0,
  played: 0,
  wins: 0,
  best: {},
  favorites: [],
  sound: true,
};
