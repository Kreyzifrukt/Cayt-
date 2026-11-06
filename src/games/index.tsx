import { ClassicGame } from "./classics";
import { ArcadeGame } from "./arcade";
import { CollectionGame } from "./collection";
import type { GameId } from "../types/game";
import { RetroGame } from "./retro";
import "../styles/retro.css";

type Props = { id: GameId; onFinish: (id: GameId, score: number, won: boolean, draw?: boolean) => void };
const ARCADE_GAMES: GameId[] = ["lights-out", "tap-blitz", "word-scramble"];
const RETRO_GAMES: GameId[] = ["fifteen-puzzle", "sokoban", "reversi", "mastermind", "blackjack", "frogger", "match-three", "maze-runner"];
const COLLECTION_GAMES: GameId[] = [
  "minesweeper", "tetris", "breakout", "pong", "simon", "hangman", "connect-four",
  "whack-a-mole", "math-sprint", "color-clash", "pattern-recall", "higher-lower",
  "typing-rush", "number-hunt", "mini-sudoku",
];
export function Game({ id, onFinish }: Props) {
  if (RETRO_GAMES.includes(id)) return <RetroGame id={id as Extract<GameId, "fifteen-puzzle" | "sokoban" | "reversi" | "mastermind" | "blackjack" | "frogger" | "match-three" | "maze-runner">} onFinish={onFinish} />;
  if (ARCADE_GAMES.includes(id)) return <ArcadeGame id={id as Extract<GameId, "lights-out" | "tap-blitz" | "word-scramble">} onFinish={onFinish} />;
  if (COLLECTION_GAMES.includes(id)) return <CollectionGame id={id as Extract<GameId, "minesweeper" | "tetris" | "breakout" | "pong" | "simon" | "hangman" | "connect-four" | "whack-a-mole" | "math-sprint" | "color-clash" | "pattern-recall" | "higher-lower" | "typing-rush" | "number-hunt" | "mini-sudoku">} onFinish={onFinish} />;
  return <ClassicGame id={id} onFinish={onFinish} />;
}
