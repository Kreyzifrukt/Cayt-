import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import type { GameId } from "../types/game";
import { createGemBoard, ensurePlayableGemBoard, findGemMatches, resolveGemCascades } from "./matchThreeLogic";
import { createShuffledDeck, handValue, type Card } from "./blackjackLogic";

type Done = (score: number, won: boolean, draw?: boolean) => void;
type Props = { id: Extract<GameId, "fifteen-puzzle" | "sokoban" | "reversi" | "mastermind" | "blackjack" | "frogger" | "match-three" | "maze-runner">; onFinish: (id: GameId, score: number, won: boolean, draw?: boolean) => void };
function Panel({ title, score, reset, children }: { title: string; score: string | number; reset: () => void; children: ReactNode }) {
  return <div className="engine collection-engine"><div className="game-toolbar"><span className="game-live"><i/> {title}</span><span className="game-score">SCORE <b>{score}</b></span></div>{children}<div className="collection-footer"><button className="secondary" onClick={reset}><RotateCcw size={14}/> RESTART</button><span>RETRO CLASSICS · LOCAL SESSION</span></div></div>;
}

const ORDER = Array.from({ length: 16 }, (_, i) => (i + 1) % 16);
function shuffle() {
  const board = [...ORDER]; let previous = -1;
  for (let n = 0; n < 220; n++) {
    const blank = board.indexOf(0);
    const options = [blank - 4, blank + 4, blank % 4 ? blank - 1 : -1, blank % 4 < 3 ? blank + 1 : -1].filter((i) => i >= 0 && i < 16 && i !== previous);
    const next = options[Math.floor(Math.random() * options.length)];
    [board[blank], board[next]] = [board[next], board[blank]]; previous = blank;
  }
  if (board.every((value, index) => value === ORDER[index])) {
    const blank = board.indexOf(0);
    const neighbor = blank % 4 > 0 ? blank - 1 : blank + 1;
    [board[blank], board[neighbor]] = [board[neighbor], board[blank]];
  }
  return board;
}
function Fifteen({ done }: { done: Done }) {
  const [board, setBoard] = useState(shuffle), [moves, setMoves] = useState(0), [won, setWon] = useState(false);
  const tap = (index: number) => {
    const blank = board.indexOf(0);
    if (won || Math.abs(index % 4 - blank % 4) + Math.abs(Math.floor(index / 4) - Math.floor(blank / 4)) !== 1) return;
    const next = [...board]; [next[index], next[blank]] = [next[blank], next[index]];
    setBoard(next); setMoves((v) => v + 1);
    if (next.every((v, i) => v === ORDER[i])) { setWon(true); done(Math.max(100, 1200 - (moves + 1) * 8), true); }
  };
  const reset = () => { setBoard(shuffle()); setMoves(0); setWon(false); };
  return <Panel title="15-PUZZLE · SLIDE INTO ORDER" score={moves} reset={reset}>
    <p className="retro-note">Arrange tiles from 1 to 15. Only a tile beside the empty space can move.</p>
    <div className="fifteen-board">{board.map((v, i) => <button key={i} className={v ? "fifteen-tile" : "fifteen-tile empty"} disabled={!v || won} onClick={() => tap(i)}>{v || ""}</button>)}</div>
    {won && <div className="result"><b>SOLVED IN {moves} MOVES</b><button onClick={reset}>NEW SHUFFLE</button></div>}
  </Panel>;
}

type SokobanLevel = { player: number; boxes: number[]; goals: number[] };
const SOKOBAN_SIZE = 8;
const SOKOBAN_DIRECTIONS = [-SOKOBAN_SIZE, SOKOBAN_SIZE, -1, 1];
function shufflePositions(values: number[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
function createSokobanLevel(): SokobanLevel {
  const interior = Array.from({ length: 36 }, (_, index) => {
    const row = Math.floor(index / 6) + 1;
    const column = index % 6 + 1;
    return row * SOKOBAN_SIZE + column;
  });
  const isInterior = (cell: number) => {
    const row = Math.floor(cell / SOKOBAN_SIZE);
    const column = cell % SOKOBAN_SIZE;
    return row >= 1 && row <= 6 && column >= 1 && column <= 6;
  };
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const goals = shufflePositions(interior).slice(0, 3);
    const reserved = new Set(goals);
    const boxes: number[] = [];
    let valid = true;
    for (const goal of goals) {
      const candidates: { start: number; path: number[]; behind: number }[] = [];
      for (const delta of SOKOBAN_DIRECTIONS) {
        for (let distance = 1; distance <= 3; distance += 1) {
          const start = goal - delta * distance;
          const behind = start - delta;
          const path = Array.from({ length: distance + 1 }, (_, step) => start + delta * step);
          if (!isInterior(behind) || !path.every(isInterior) || reserved.has(behind)) continue;
          if (path.some((cell) => cell !== goal && reserved.has(cell))) continue;
          candidates.push({ start, path, behind });
        }
      }
      const chosenIndex = shufflePositions(candidates.map((_, index) => index))[0];
      const chosen = chosenIndex === undefined ? undefined : candidates[chosenIndex];
      if (!chosen) { valid = false; break; }
      boxes.push(chosen.start);
      chosen.path.forEach((cell) => reserved.add(cell));
      reserved.add(chosen.behind);
    }
    if (!valid || boxes.length !== 3) continue;
    const playerOptions = shufflePositions(interior.filter((cell) => !reserved.has(cell)));
    if (playerOptions.length) return { player: playerOptions[0], boxes, goals };
  }
  return { player: 51, boxes: [19, 35, 44], goals: [11, 34, 37] };
}
function Sokoban({ done }: { done: Done }) {
  const [level, setLevel] = useState(createSokobanLevel);
  const [player, setPlayer] = useState(level.player);
  const [boxes, setBoxes] = useState(level.boxes);
  const [moves, setMoves] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  const [won, setWon] = useState(false);
  const walls = new Set(Array.from({ length: 64 }, (_, index) => {
    const row = Math.floor(index / SOKOBAN_SIZE);
    const column = index % SOKOBAN_SIZE;
    return row === 0 || row === 7 || column === 0 || column === 7 ? index : -1;
  }).filter((index) => index >= 0));
  const goals = new Set(level.goals);
  const move = useCallback((delta: number) => {
    if (won) return;
    const next = player + delta;
    if (next < 0 || next >= 64 || walls.has(next)) return;
    const box = boxes.indexOf(next);
    let updated = boxes;
    if (box >= 0) {
      const beyond = next + delta;
      if (beyond < 0 || beyond >= 64 || walls.has(beyond) || boxes.includes(beyond)) return;
      updated = [...boxes];
      updated[box] = beyond;
      setBoxes(updated);
    }
    setPlayer(next);
    setMoves((value) => value + 1);
    if (goals.size === updated.filter((position) => goals.has(position)).length) {
      setWon(true);
      done(Math.max(100, 1000 - (moves + 1) * 12), true);
    }
  }, [boxes, done, goals, moves, player, walls, won]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const map: Record<string, number> = { arrowup: -8, w: -8, arrowdown: 8, s: 8, arrowleft: -1, a: -1, arrowright: 1, d: 1 };
      if (map[key] !== undefined) { event.preventDefault(); move(map[key]); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);
  const reset = () => {
    setPlayer(level.player);
    setBoxes(level.boxes);
    setMoves(0);
    setWon(false);
  };
  const nextLevel = () => {
    const next = createSokobanLevel();
    setLevel(next); setPlayer(next.player); setBoxes(next.boxes);
    setMoves(0); setWon(false); setLevelNumber((value) => value + 1);
  };
  return <Panel title={`SOKOBAN · LEVEL ${levelNumber}`} score={moves} reset={reset}>
    <p className="retro-note">Push all three crates onto the glowing goals. Each new level is generated with a guaranteed push route. Use arrows or WASD.</p>
    <div className="sokoban-board" role="grid" aria-label="Sokoban level">
      {Array.from({ length: 64 }, (_, index) => {
        const box = boxes.includes(index), goal = goals.has(index);
        return <span key={index} role="gridcell" className={["sokoban-cell", walls.has(index) ? "wall" : "", goal ? "goal" : "", box ? "box" : "", player === index ? "player" : ""].join(" ")}>
          {player === index ? "●" : box ? "■" : goal ? "◆" : ""}
        </span>;
      })}
    </div>
    <div className="retro-pad"><button onClick={() => move(-8)} aria-label="Move up">↑</button><div><button onClick={() => move(-1)} aria-label="Move left">←</button><button onClick={() => move(8)} aria-label="Move down">↓</button><button onClick={() => move(1)} aria-label="Move right">→</button></div></div>
    {won && <div className="result"><b>LEVEL CLEARED · NEW LEVEL READY</b><button onClick={nextLevel}>NEXT LEVEL</button></div>}
  </Panel>;
}

type Disk = 0 | 1 | 2;
function flips(board: Disk[], index: number, player: Disk) {
  if (board[index]) return [];
  const row = Math.floor(index / 8), col = index % 8, other = player === 1 ? 2 : 1, found: number[] = [];
  for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    const line: number[] = []; let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === other) { line.push(r * 8 + c); r += dr; c += dc; }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === player) found.push(...line);
  }
  return found;
}
function Reversi({ done }: { done: Done }) {
  const initial = () => {
    const board: Disk[] = Array(64).fill(0);
    board[27] = 2; board[28] = 1; board[35] = 1; board[36] = 2;
    return board;
  };
  const [board, setBoard] = useState(initial);
  const [ended, setEnded] = useState(false);
  const [message, setMessage] = useState("YOUR TURN · PLAY A GLOWING CELL");
  const finish = (next: Disk[]) => {
    const mine = next.filter((value) => value === 1).length;
    const cpu = next.filter((value) => value === 2).length;
    setBoard(next); setEnded(true);
    setMessage(mine > cpu ? "YOU WIN" : mine === cpu ? "DRAW" : "CPU WINS");
    done(mine * 10, mine > cpu, mine === cpu);
  };
  const bestMove = (position: Disk[], player: Disk) => {
    const options = position.flatMap((value, index) => value === 0 && flips(position, index, player).length ? [index] : []);
    options.sort((a, b) =>
      ([0, 7, 56, 63].includes(b) ? 100 : 0) + flips(position, b, player).length -
      (([0, 7, 56, 63].includes(a) ? 100 : 0) + flips(position, a, player).length),
    );
    return options[0];
  };
  const apply = (position: Disk[], index: number, player: Disk) => {
    const next = [...position], captured = flips(position, index, player);
    next[index] = player; captured.forEach((cell) => { next[cell] = player; });
    return next;
  };
  const legalMoves = board.map((value, index) => value === 0 && flips(board, index, 1).length > 0);
  const play = (index: number) => {
    if (ended) return;
    const captured = flips(board, index, 1);
    if (!captured.length) return;
    let next = apply(board, index, 1);
    while (true) {
      const cpuMove = bestMove(next, 2), playerMove = bestMove(next, 1);
      if (cpuMove === undefined && playerMove === undefined) { finish(next); return; }
      if (cpuMove === undefined) { setBoard(next); setMessage("CPU PASSES · YOUR TURN"); return; }
      next = apply(next, cpuMove, 2);
      if (bestMove(next, 1) !== undefined) { setBoard(next); setMessage("YOUR TURN · PLAY A GLOWING CELL"); return; }
    }
  };
  const reset = () => { setBoard(initial()); setEnded(false); setMessage("YOUR TURN · PLAY A GLOWING CELL"); };
  return <Panel title="REVERSI · FLIP THE CPU DISCS" score={board.filter((value) => value === 1).length + " : " + board.filter((value) => value === 2).length} reset={reset}>
    <p className="retro-note">Place a disc to trap CPU discs between yours in a straight line. Only glowing empty cells are legal. Corners are powerful.</p>
    <div className="reversi-legend"><span><i className="mint-disc"/> YOU</span><span><i className="cpu-disc"/> CPU</span><span><i className="legal-dot"/> LEGAL MOVE</span></div>
    <div className="reversi-board" role="grid" aria-label="Reversi board">
      {board.map((value, index) => <button key={index} role="gridcell" className={["reversi-cell", legalMoves[index] ? "legal" : ""].join(" ")} disabled={ended || !legalMoves[index]} onClick={() => play(index)} aria-label={`Row ${Math.floor(index / 8) + 1}, column ${index % 8 + 1}${legalMoves[index] ? ", legal move" : ""}`}>
        <i className={value === 1 ? "mint-disc" : value === 2 ? "cpu-disc" : legalMoves[index] ? "legal-dot" : ""}/>
      </button>)}
    </div>
    <div className="retro-status">{message}</div>
    {ended && <div className="result"><b>{message}</b><button onClick={reset}>REMATCH</button></div>}
  </Panel>;
}

const CODE = ["#79f0bd","#8db7ff","#c39aff","#ff8da7","#ffd16e","#72dce8"];
function feedback(secret: number[], guess: number[]) {
  let exact=0; const left=[...secret], extra:number[]=[];
  guess.forEach((v,i)=>{if(v===secret[i]){exact++;left[i]=-1;}else extra.push(v);});
  let misplaced=0; extra.forEach(v=>{const i=left.indexOf(v);if(i>=0){misplaced++;left[i]=-1;}});
  return {exact,misplaced};
}
function Mastermind({ done }: { done: Done }) {
  const [secret, setSecret] = useState(() => Array.from({ length: 4 }, () => Math.floor(Math.random() * 6)));
  const [guess, setGuess] = useState([0, 1, 2, 3]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [history, setHistory] = useState<{ values: number[]; exact: number; misplaced: number }[]>([]);
  const [ended, setEnded] = useState(false);
  const chooseColor = (color: number) => {
    if (ended) return;
    setGuess((current) => current.map((value, index) => index === activeSlot ? color : value));
    if (activeSlot < 3) setActiveSlot((slot) => slot + 1);
  };
  const submit = () => {
    if (ended) return;
    const result = feedback(secret, guess), next = [...history, { values: [...guess], ...result }];
    setHistory(next);
    if (result.exact === 4) { setEnded(true); done((9 - next.length) * 100, true); }
    else if (next.length === 8) { setEnded(true); done(50, false); }
  };
  const reset = () => {
    setSecret(Array.from({ length: 4 }, () => Math.floor(Math.random() * 6)));
    setGuess([0, 1, 2, 3]); setActiveSlot(0); setHistory([]); setEnded(false);
  };
  return <Panel title="MASTERMIND · BREAK THE 4-COLOR CODE" score={history.length + "/8"} reset={reset}>
    <p className="retro-note">Select a slot, choose its color, then submit all four. Repeated colors are allowed. You have eight attempts.</p>
    <div className="master-slots" aria-label="Current code guess">
      {guess.map((value, index) => <button key={index} className={activeSlot === index ? "master-slot active" : "master-slot"} style={{ background: CODE[value] }} onClick={() => setActiveSlot(index)} disabled={ended} aria-label={`Select slot ${index + 1}`}>
        <span>{index + 1}</span>
      </button>)}
    </div>
    <p className="master-active-slot">EDITING SLOT {activeSlot + 1} OF 4</p>
    <div className="master-palette" aria-label="Choose a color">
      {CODE.map((color, index) => <button key={color} className="master-color" style={{ background: color }} onClick={() => chooseColor(index)} disabled={ended} aria-label={`Choose color ${index + 1}`} title={`Color ${index + 1}`}/>)}
    </div>
    <div className="master-feedback-help"><span><b>EXACT</b> = right color, right slot</span><span><b>MISPLACED</b> = right color, wrong slot</span></div>
    <button className="primary retro-submit" onClick={submit} disabled={ended}>SUBMIT GUESS</button>
    <div className="master-history">{history.map((row, index) => <div key={index}>
      <span>{index + 1}</span>
      {row.values.map((value, slot) => <i key={slot} style={{ background: CODE[value] }} aria-label={`Color ${value + 1}`}/>)}
      <b>{row.exact} exact · {row.misplaced} misplaced</b>
    </div>)}</div>
    {ended && <div className="result"><b>{history[history.length - 1]?.exact === 4 ? "CODE CRACKED" : "CODE: " + secret.map((value) => value + 1).join(" · ")}</b><button onClick={reset}>NEW CODE</button></div>}
  </Panel>;
}

function Blackjack({done}:{done:Done}){
  const [deck,setDeck]=useState<Card[]>([]),[player,setPlayer]=useState<Card[]>([]),[dealer,setDealer]=useState<Card[]>([]),[active,setActive]=useState(false),[status,setStatus]=useState("DEAL TO START"),[ended,setEnded]=useState(false);
  const finish=(hand:Card[],house:Card[],remaining:Card[])=>{const d=[...house],cards=[...remaining];while(handValue(d)<17&&cards.length)d.push(cards.shift()!);const p=handValue(hand),h=handValue(d),won=p<=21&&(h>21||p>h);setDealer(d);setDeck(cards);setActive(false);setEnded(true);setStatus(p===h?"PUSH · DRAW":won?"YOU WIN":"DEALER WINS");done(won?p*20:20,won,p<=21&&h<=21&&p===h);};
  const start=()=>{const cards=createShuffledDeck(),p=cards.slice(0,2),d=cards.slice(2,4);setDeck(cards.slice(4));setPlayer(p);setDealer(d);setActive(true);setEnded(false);setStatus("YOUR MOVE");if(handValue(d)===21){finish(p,d,cards.slice(4));}else if(handValue(p)===21){setActive(false);setEnded(true);setStatus("BLACKJACK");done(500,true);}};
  const hit=()=>{if(!active||!deck.length)return;const hand=[...player,deck[0]],rest=deck.slice(1);setPlayer(hand);setDeck(rest);if(handValue(hand)>21){setActive(false);setEnded(true);setStatus("BUST");done(handValue(hand),false);}else if(handValue(hand)===21)finish(hand,dealer,rest);};
  const reset=()=>{setDeck([]);setPlayer([]);setDealer([]);setActive(false);setEnded(false);setStatus("DEAL TO START");};
  const label=(c:Card)=>(c.rank===1?"A":c.rank===11?"J":c.rank===12?"Q":c.rank===13?"K":c.rank)+c.suit;
  return <Panel title="BLACKJACK · DEALER STANDS ON 17" score={player.length?handValue(player):"—"} reset={reset}>
    <p className="retro-note">Get closer to 21 than the dealer without going over. Face cards count as 10; aces count as 1 or 11.</p>
    <div className="blackjack-table"><div><small>DEALER · {dealer.length?(active&&dealer.length>1?handValue([dealer[0]])+" + ?":handValue(dealer)):"—"}</small><div className="playing-cards">{dealer.map((c,i)=><b key={i} className={c.suit==="♥"||c.suit==="♦"?"red-card":""}>{active&&i===1?"?":label(c)}</b>)}</div></div><div><small>YOU · {player.length?handValue(player):"—"}</small><div className="playing-cards">{player.map((c,i)=><b key={i} className={c.suit==="♥"||c.suit==="♦"?"red-card":""}>{label(c)}</b>)}</div></div></div>
    <div className="retro-actions"><button className="primary" onClick={start} disabled={active}>DEAL</button><button className="secondary" onClick={hit} disabled={!active}>HIT</button><button className="secondary" onClick={()=>finish(player,dealer,deck)} disabled={!active}>STAND</button></div>
    <div className="retro-status">{status}</div>{ended&&<div className="result"><b>{status}</b><button onClick={start}>NEW HAND</button></div>}
  </Panel>;
}

function Frogger({done}:{done:Done}){
  const [frog,setFrog]=useState(76),[cars,setCars]=useState([19,22,25,30,34,38,43,47,51,55,59]),[crossings,setCrossings]=useState(0),[lives,setLives]=useState(3),[ended,setEnded]=useState(false);
  useEffect(()=>{if(ended)return;const timer=window.setInterval(()=>setCars(old=>old.map(cell=>{const row=Math.floor(cell/9),direction=row%2?1:-1;return row*9+(cell%9+direction+9)%9;})),520);return()=>window.clearInterval(timer);},[ended]);
  // Moving vehicles must collide with a stationary frog too.
  useEffect(()=>{
    if(ended||!cars.includes(frog))return;
    if(lives<=1){setLives(0);setEnded(true);done(crossings*150,false);}
    else{setLives(value=>value-1);setFrog(76);}
  },[cars,frog,lives,ended,crossings,done]);
  const move=(delta:number)=>{if(ended)return;const next=frog+delta;if(next<0||next>=81||(delta===-1&&frog%9===0)||(delta===1&&frog%9===8))return;if(cars.includes(next)){if(lives<=1){setLives(0);setEnded(true);done(crossings*150,false);}else setLives(v=>v-1);setFrog(76);return;}if(Math.floor(next/9)===0){const count=crossings+1;setCrossings(count);setFrog(76);if(count===3){setEnded(true);done(900,true);}return;}setFrog(next);};
  useEffect(()=>{const key=(e:KeyboardEvent)=>{const d:Record<string,number>={ArrowUp:-9,w:-9,ArrowDown:9,s:9,ArrowLeft:-1,a:-1,ArrowRight:1,d:1};if(d[e.key]!==undefined){e.preventDefault();move(d[e.key]);}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);});
  const reset=()=>{setFrog(76);setCars([19,22,25,30,34,38,43,47,51,55,59]);setCrossings(0);setLives(3);setEnded(false);};
  return <Panel title="FROGGER · THREE SAFE CROSSINGS" score={crossings+"/3 · "+lives+" LIVES"} reset={reset}>
    <p className="retro-note">Cross the traffic lanes three times. Cars move in opposite directions on alternating lanes.</p>
    <div className="frogger-board">{Array.from({length:81},(_,i)=><span key={i} className={i===frog?"frog":cars.includes(i)?"car":i<9?"river-bank":""}>{i===frog?"●":""}</span>)}</div>
    <div className="retro-pad"><button onClick={()=>move(-9)}>↑</button><div><button onClick={()=>move(-1)}>←</button><button onClick={()=>move(9)}>↓</button><button onClick={()=>move(1)}>→</button></div></div>
    {ended&&<div className="result"><b>{crossings===3?"CROSSING COMPLETE":"OUT OF LIVES"}</b><button onClick={reset}>TRY AGAIN</button></div>}
  </Panel>;
}

const GEMS=["mint","blue","pink","gold","violet"];
function MatchThree({done}:{done:Done}){
  const [board,setBoard]=useState(createGemBoard),[selected,setSelected]=useState<number|null>(null),[score,setScore]=useState(0),[moves,setMoves]=useState(25),[ended,setEnded]=useState(false);
  const [status,setStatus]=useState("TAP A GEM, THEN TAP A NEIGHBOR");
  const tap=(index:number)=>{
    if(ended)return;
    if(selected===null){setSelected(index);setStatus("NOW TAP AN ADJACENT GEM");return;}
    if(selected===index){setSelected(null);setStatus("SELECT A GEM TO MOVE");return;}
    if(Math.abs(selected%7-index%7)+Math.abs(Math.floor(selected/7)-Math.floor(index/7))!==1){setSelected(index);setStatus("CHOOSE A GEM NEXT TO THE HIGHLIGHTED ONE");return;}
    const next=board.map(row=>[...row]),ar=Math.floor(selected/7),ac=selected%7,br=Math.floor(index/7),bc=index%7;
    [next[ar][ac],next[br][bc]]=[next[br][bc],next[ar][ac]];
    if(!findGemMatches(next).size){setSelected(null);setStatus("NO MATCH · SWAP MUST MAKE A LINE OF 3 OR MORE");return;}
    const resolved=resolveGemCascades(next);
    const total=score+resolved.cleared*20,left=moves-1;
    setBoard(ensurePlayableGemBoard(resolved.board));setScore(total);setMoves(left);setSelected(null);
    setStatus(`MATCH! +${resolved.cleared*20} POINTS`);
    if(total>=600){setEnded(true);done(total,true);}else if(left===0){setEnded(true);done(total,false);}
  };
  const reset=()=>{setBoard(createGemBoard());setSelected(null);setScore(0);setMoves(25);setEnded(false);setStatus("TAP A GEM, THEN TAP A NEIGHBOR");};
  return <Panel title="GEM MATCH · THREE IN A ROW" score={score} reset={reset}>
    <p className="retro-note">Tap one gem, then an adjacent gem. The swap is accepted only if it makes a line of three or more. Reach 600 points within 25 moves.</p>
    <div className="match-meta"><span>{moves} MOVES LEFT</span><b>TARGET 600</b></div>
    <div className="match-board" aria-label="Gem Match board">{board.flatMap((row,r)=>row.map((gem,c)=><button key={r*7+c} className={"gem gem-"+GEMS[gem]+(selected===r*7+c?" selected":"")} onClick={()=>tap(r*7+c)} aria-pressed={selected===r*7+c} aria-label={`${GEMS[gem]} gem, row ${r+1}, column ${c+1}`}/>))}</div>
    <div className="retro-status" aria-live="polite">{status}</div>
    {ended&&<div className="result"><b>{score>=600?"TARGET REACHED":"FINAL SCORE: "+score}</b><button onClick={reset}>PLAY AGAIN</button></div>}
  </Panel>;
}

const MAZE = ["#########", "#   #   #", "# # # # #", "# #   # #", "# ### # #", "#   K   #", "### # ###", "#      E#", "#########"];
function MazeRunner({ done }: { done: Done }) {
  const [player, setPlayer] = useState(10), [keyFound, setKeyFound] = useState(false), [moves, setMoves] = useState(0), [ended, setEnded] = useState(false);
  const cells = MAZE.join("");
  const walls = new Set(cells.split("").flatMap((value, index) => value === "#" ? [index] : []));
  const key = cells.indexOf("K"), exit = cells.indexOf("E");
  const move = useCallback((delta: number) => {
    if (ended) return;
    const next = player + delta;
    if (walls.has(next) || next < 0 || next >= 81 || (delta === 1 && player % 9 === 8) || (delta === -1 && player % 9 === 0)) return;
    setPlayer(next); setMoves((value) => value + 1);
    if (next === key) setKeyFound(true);
    if (next === exit && keyFound) { setEnded(true); done(Math.max(100, 800 - (moves + 1) * 8), true); }
  }, [done, ended, exit, key, keyFound, moves, player, walls]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const map: Record<string, number> = { arrowup: -9, w: -9, arrowdown: 9, s: 9, arrowleft: -1, a: -1, arrowright: 1, d: 1 };
      const delta = map[event.key.toLowerCase()];
      if (delta !== undefined) { event.preventDefault(); move(delta); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);
  const reset = () => { setPlayer(10); setKeyFound(false); setMoves(0); setEnded(false); };
  return <Panel title="MAZE RUNNER · FIND THE KEY" score={moves} reset={reset}>
    <p className="retro-note">Find the key, then reach the exit. Use arrow keys or WASD. Green dot = player, diamond = key, arrow = exit.</p>
    <div className="maze-board" role="grid" aria-label="Maze playfield">
      {cells.split("").map((value, index) => <span key={index} role="gridcell" className={["maze-cell", value === "#" ? "wall" : "", value === "K" && !keyFound ? "key-cell" : "", value === "E" ? "exit-cell" : "", player === index ? "runner" : ""].join(" ")}>
        {player === index ? "●" : value === "K" && !keyFound ? "◆" : value === "E" ? "⇧" : ""}
      </span>)}
    </div>
    <div className="retro-status">{keyFound ? "KEY ACQUIRED · FIND THE EXIT" : "KEY NOT FOUND"}</div>
    <div className="retro-pad"><button onClick={() => move(-9)} aria-label="Move up">↑</button><div><button onClick={() => move(-1)} aria-label="Move left">←</button><button onClick={() => move(9)} aria-label="Move down">↓</button><button onClick={() => move(1)} aria-label="Move right">→</button></div></div>
    {ended && <div className="result"><b>MAZE CLEARED</b><button onClick={reset}>RUN AGAIN</button></div>}
  </Panel>;
}

export function RetroGame({id,onFinish}:Props){
  const finishRef=useRef(onFinish);
  finishRef.current=onFinish;
  const done=useCallback((score:number,won:boolean,draw=false)=>finishRef.current(id,score,won,draw),[id]);
  switch(id){
    case "fifteen-puzzle":return <Fifteen done={done}/>;
    case "sokoban":return <Sokoban done={done}/>;
    case "reversi":return <Reversi done={done}/>;
    case "mastermind":return <Mastermind done={done}/>;
    case "blackjack":return <Blackjack done={done}/>;
    case "frogger":return <Frogger done={done}/>;
    case "match-three":return <MatchThree done={done}/>;
    case "maze-runner":return <MazeRunner done={done}/>;
  }
}
