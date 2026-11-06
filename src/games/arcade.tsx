import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { GameId } from "../types/game";

type Props = {
  id: Extract<GameId, "lights-out" | "tap-blitz" | "word-scramble">;
  onFinish: (id: GameId, score: number, won: boolean, draw?: boolean) => void;
};

function Toolbar({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="game-toolbar">
      <span className="game-live"><i /> {label}</span>
      <span className="game-score">SCORE <b>{value}</b></span>
    </div>
  );
}

function toggleCross(board: boolean[], index: number): boolean[] {
  const next = [...board];
  const row = Math.floor(index / 5);
  const col = index % 5;
  for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]) {
    if (r >= 0 && r < 5 && c >= 0 && c < 5) {
      const cell = r * 5 + c;
      next[cell] = !next[cell];
    }
  }
  return next;
}

function createLightsBoard(): boolean[] {
  let board = Array(25).fill(false) as boolean[];
  for (let i = 0; i < 13; i += 1) {
    board = toggleCross(board, Math.floor(Math.random() * 25));
  }
  // Keep every new puzzle playable instead of occasionally generating an instant win.
  if (board.every((cell) => !cell)) board = toggleCross(board, 12);
  return board;
}

function LightsOut({ onFinish }: Pick<Props, "onFinish">) {
  const [board, setBoard] = useState(createLightsBoard);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);
  const finished = useRef(false);

  const play = (index: number) => {
    if (complete) return;
    const next = toggleCross(board, index);
    const count = moves + 1;
    setBoard(next);
    setMoves(count);
    if (next.every((cell) => !cell) && !finished.current) {
      finished.current = true;
      setComplete(true);
      onFinish("lights-out", Math.max(50, 1000 - count * 15), true);
    }
  };

  const reset = () => {
    finished.current = false;
    setBoard(createLightsBoard());
    setMoves(0);
    setComplete(false);
  };

  return (
    <div className="engine arcade-engine">
      <Toolbar label={complete ? "GRID CLEARED" : "SWITCH OFF EVERY LIGHT"} value={moves} />
      <div className="lights-board" role="group" aria-label="Lights Out puzzle">
        {board.map((on, index) => (
          <button
            key={index}
            className={on ? "light-cell is-on" : "light-cell"}
            onClick={() => play(index)}
            disabled={complete}
            aria-label={`Cell ${index + 1}, ${on ? "lit" : "off"}`}
            aria-pressed={on}
          />
        ))}
      </div>
      {complete ? (
        <div className="result"><b>ALL LIGHTS OUT. CLEAN WORK.</b><button onClick={reset}>NEW PUZZLE</button></div>
      ) : (
        <div className="game-action-row">
          <span>ONE MOVE FLIPS A CELL AND ITS NEIGHBORS</span>
          <button className="secondary" onClick={reset}><RotateCcw size={14} /> RESET</button>
        </div>
      )}
    </div>
  );
}

function TapBlitz({ onFinish }: Pick<Props, "onFinish">) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [remaining, setRemaining] = useState(20);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(4);
  const startAt = useRef(0);
  const finished = useRef(false);
  const scoreRef = useRef(0);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, 20 - Math.floor((Date.now() - startAt.current) / 1000));
      setRemaining(seconds);
      if (seconds === 0 && !finished.current) {
        finished.current = true;
        setPhase("done");
        finishRef.current("tap-blitz", scoreRef.current * 20, scoreRef.current >= 10);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const handleKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < 9) {
        event.preventDefault();
        hit(index);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, target]);

  const start = () => {
    finished.current = false;
    scoreRef.current = 0;
    setScore(0);
    setRemaining(20);
    setTarget(Math.floor(Math.random() * 9));
    startAt.current = Date.now();
    setPhase("playing");
  };

  const hit = (index: number) => {
    if (phase !== "playing" || index !== target) return;
    const next = scoreRef.current + 1;
    scoreRef.current = next;
    setScore(next);
    setTarget((current) => (current + 1 + Math.floor(Math.random() * 8)) % 9);
  };

  return (
    <div className="engine arcade-engine">
      <Toolbar label={phase === "done" ? "ROUND COMPLETE" : phase === "ready" ? "AIM FOR THE TARGET" : "TARGET ACTIVE"} value={score} />
      <div className="tap-status"><span>TIME LEFT</span><b>{remaining}s</b></div>
      <div className="tap-board" role="group" aria-label="Tap the highlighted target">
        {Array.from({ length: 9 }, (_, index) => (
          <button
            key={index}
            className={phase === "playing" && target === index ? "tap-cell is-target" : "tap-cell"}
            onClick={() => hit(index)}
            disabled={phase !== "playing"}
            aria-label={phase === "playing" && target === index ? `Target, key ${index + 1}` : `Empty cell, key ${index + 1}`}
          />
        ))}
      </div>
      {phase === "ready" ? (
        <div className="result"><b>HIT AS MANY TARGETS AS YOU CAN IN 20 SECONDS.</b><button onClick={start}>START ROUND</button></div>
      ) : phase === "done" ? (
        <div className="result"><b>{score} HITS. {score >= 10 ? "SOLID AIM." : "ROOM TO IMPROVE."}</b><button onClick={start}>PLAY AGAIN</button></div>
      ) : (
        <div className="game-action-row"><span>ONLY THE GLOWING TILE COUNTS</span><span>1–9 KEYS ALSO WORK</span></div>
      )}
    </div>
  );
}

const WORDS = ["PLANET", "PUZZLE", "GALAXY", "ROCKET", "ARCADE"];

function scramble(word: string): string[] {
  const letters = word.split("");
  // Fisher–Yates gives each permutation an equal chance.
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // Avoid handing the answer to the player in its original order.
  if (letters.join("") === word) [letters[0], letters[1]] = [letters[1], letters[0]];
  return letters;
}

function WordScramble({ onFinish }: Pick<Props, "onFinish">) {
  const [round, setRound] = useState(0);
  const [letters, setLetters] = useState(() => scramble(WORDS[0]));
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [complete, setComplete] = useState(false);
  const guess = selected.map((index) => letters[index]).join("");

  const submit = () => {
    if (guess.length !== WORDS[round].length || complete) return;
    if (guess === WORDS[round]) {
      const total = score + Math.max(50, 150 - attempts * 15);
      setScore(total);
      if (round === WORDS.length - 1) {
        setComplete(true);
        onFinish("word-scramble", total, true);
        return;
      }
      const next = round + 1;
      setRound(next);
      setLetters(scramble(WORDS[next]));
      setSelected([]);
      setAttempts(0);
      return;
    }
    setAttempts((value) => value + 1);
    setSelected([]);
  };

  const reset = () => {
    setRound(0);
    setLetters(scramble(WORDS[0]));
    setSelected([]);
    setScore(0);
    setAttempts(0);
    setComplete(false);
  };

  return (
    <div className="engine arcade-engine word-engine">
      <Toolbar label={complete ? "ALL WORDS SOLVED" : `WORD ${round + 1} / ${WORDS.length}`} value={score} />
      <p className="word-instruction">UNSCRAMBLE THE LETTERS TO REVEAL THE WORD</p>
      <div className="word-answer" aria-live="polite">
        {Array.from({ length: WORDS[round].length }, (_, index) => <span key={index}>{guess[index] ?? ""}</span>)}
      </div>
      <div className="letter-bank">
        {letters.map((letter, index) => (
          <button
            key={index}
            className="letter-tile"
            onClick={() => setSelected((value) => [...value, index])}
            disabled={selected.includes(index) || complete}
            aria-label={`Letter ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="game-action-row">
        <span>{attempts} INCORRECT ATTEMPTS</span>
        <button className="secondary" onClick={() => setSelected([])} disabled={complete}>CLEAR</button>
        <button className="secondary" onClick={submit} disabled={complete || selected.length !== WORDS[round].length}>CHECK WORD</button>
      </div>
      {complete && <div className="result"><b>FIVE FOR FIVE. WORDSMITH STATUS.</b><button onClick={reset}>PLAY AGAIN</button></div>}
    </div>
  );
}

export function ArcadeGame({ id, onFinish }: Props) {
  switch (id) {
    case "lights-out": return <LightsOut onFinish={onFinish} />;
    case "tap-blitz": return <TapBlitz onFinish={onFinish} />;
    case "word-scramble": return <WordScramble onFinish={onFinish} />;
    default: return <div className="engine">Game not found.</div>;
  }
}
