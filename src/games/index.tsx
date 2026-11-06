import { ClassicGame } from "./classics";
import { ArcadeGame } from "./arcade";
import type { GameId } from "../types/game";

type Props = { id: GameId; onFinish: (id: GameId, score: number, won: boolean) => void };
const NEW_GAMES: GameId[] = ["lights-out", "tap-blitz", "word-scramble"];

export function Game({ id, onFinish }: Props) {
  if (NEW_GAMES.includes(id)) return <ArcadeGame id={id as Extract<GameId, "lights-out" | "tap-blitz" | "word-scramble">} onFinish={onFinish} />;
  return <ClassicGame id={id} onFinish={onFinish} />;
}
