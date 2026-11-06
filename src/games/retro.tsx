import { useCallback, useEffect, useState } from "react";
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

const SOKO = ["########", "#  .   #", "#  $   #", "#  ##  #", "# .$ . #", "#   $  #", "#  @   #", "########"];
function Sokoban({ done }: { done: Done }) {
  const [player, setPlayer] = useState(SOKO.join("").indexOf("@"));
  const [boxes, setBoxes] = useState(SOKO.join("").split("").flatMap((v, i) => v === "$" ? [i] : []));
  const [moves, setMoves] = useState(0), [won, setWon] = useState(false);
  const walls = new Set(SOKO.join("").split("").flatMap((v, i) => v === "#" ? [i] : []));
  const goals = new Set(SOKO.join("").split("").flatMap((v, i) => v === "." ? [i] : []));
  const move = useCallback((delta: number) => {
    if (won) return;
    const next = player + delta;
    if (walls.has(next)) return;
    const box = boxes.indexOf(next); let updated = boxes;
    if (box >= 0) { const beyond = next + delta; if (walls.has(beyond) || boxes.includes(beyond)) return; updated = [...boxes]; updated[box] = beyond; setBoxes(updated); }
    setPlayer(next); setMoves((v) => v + 1);
    if (goals.size === updated.filter((v) => goals.has(v)).length) { setWon(true); done(Math.max(100, 1000 - (moves + 1) * 12), true); }
  }, [boxes, done, goals, moves, player, walls, won]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { const map: Record<string, number> = { ArrowUp: -8, w: -8, ArrowDown: 8, s: 8, ArrowLeft: -1, a: -1, ArrowRight: 1, d: 1 }; if (map[e.key] !== undefined) { e.preventDefault(); move(map[e.key]); } };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [move]);
  const reset = () => { setPlayer(SOKO.join("").indexOf("@")); setBoxes(SOKO.join("").split("").flatMap((v, i) => v === "$" ? [i] : [])); setMoves(0); setWon(false); };
  return <Panel title="SOKOBAN · PUSH, NEVER PULL" score={moves} reset={reset}>
    <p className="retro-note">Push every crate onto a storage point. You cannot pull crates back.</p>
    <div className="sokoban-board">{SOKO.join("").split("").map((v, i) => <span key={i} className={["sokoban-cell", v === "#" ? "wall" : "", goals.has(i) ? "goal" : "", boxes.includes(i) ? "box" : "", player === i ? "player" : ""].join(" ")}>{player === i ? "●" : boxes.includes(i) ? "■" : goals.has(i) ? "◆" : ""}</span>)}</div>
    <div className="retro-pad"><button onClick={() => move(-8)}>↑</button><div><button onClick={() => move(-1)}>←</button><button onClick={() => move(8)}>↓</button><button onClick={() => move(1)}>→</button></div></div>
    {won && <div className="result"><b>ALL CRATES STORED</b><button onClick={reset}>PLAY AGAIN</button></div>}
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
  const initial=()=>{const board:Disk[]=Array(64).fill(0);board[27]=2;board[28]=1;board[35]=1;board[36]=2;return board;};
  const [board,setBoard]=useState(initial),[ended,setEnded]=useState(false),[message,setMessage]=useState("YOUR TURN");
  const finish=(next:Disk[])=>{const mine=next.filter(value=>value===1).length,cpu=next.filter(value=>value===2).length;setBoard(next);setEnded(true);setMessage(mine>cpu?"YOU WIN":mine===cpu?"DRAW":"CPU WINS");done(mine*10,mine>cpu,mine===cpu);};
  const bestMove=(position:Disk[],player:Disk)=>{
    const options=position.flatMap((value,index)=>value===0&&flips(position,index,player).length?[index]:[]);
    options.sort((a,b)=>([0,7,56,63].includes(b)?100:0)+flips(position,b,player).length-(([0,7,56,63].includes(a)?100:0)+flips(position,a,player).length));
    return options[0];
  };
  const apply=(position:Disk[],index:number,player:Disk)=>{
    const next=[...position],captured=flips(position,index,player);
    next[index]=player;captured.forEach(cell=>next[cell]=player);return next;
  };
  const play=(index:number)=>{
    if(ended)return;
    const captured=flips(board,index,1);
    if(!captured.length)return;
    let next=apply(board,index,1);
    while(true){
      const cpuMove=bestMove(next,2);
      const playerMove=bestMove(next,1);
      if(cpuMove===undefined&&playerMove===undefined){finish(next);return;}
      if(cpuMove===undefined){
        setBoard(next);
        setMessage("CPU PASSES · YOUR TURN");
        return;
      }
      next=apply(next,cpuMove,2);
      if(bestMove(next,1)!==undefined){
        setBoard(next);
        setMessage("YOUR TURN");
        return;
      }
      // If the player has no legal move, the CPU takes another turn automatically.
    }
  };
  const reset=()=>{setBoard(initial());setEnded(false);setMessage("YOUR TURN");};
  return <Panel title="REVERSI · CONTROL THE BOARD" score={board.filter(value=>value===1).length+" : "+board.filter(value=>value===2).length} reset={reset}>
    <p className="retro-note">Trap the CPU's discs in a straight line to flip them. Corners are valuable.</p>
    <div className="reversi-board">{board.map((value,index)=><button key={index} className="reversi-cell" disabled={ended||!flips(board,index,1).length} onClick={()=>play(index)} aria-label={`Row ${Math.floor(index/8)+1}, column ${index%8+1}`}><i className={value===1?"mint-disc":value===2?"cpu-disc":""}/></button>)}</div>
    <div className="retro-status">{message}</div>
    {ended&&<div className="result"><b>{message}</b><button onClick={reset}>REMATCH</button></div>}
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
  const [secret,setSecret]=useState(()=>Array.from({length:4},()=>Math.floor(Math.random()*6)));
  const [guess,setGuess]=useState([0,1,2,3]);
  const [history,setHistory]=useState<{values:number[];exact:number;misplaced:number}[]>([]);
  const [ended,setEnded]=useState(false);
  const submit=()=>{if(ended)return;const result=feedback(secret,guess),next=[...history,{values:[...guess],...result}];setHistory(next);if(result.exact===4){setEnded(true);done((9-next.length)*100,true);}else if(next.length===8){setEnded(true);done(50,false);}else setGuess([0,1,2,3]);};
  const reset=()=>{setSecret(Array.from({length:4},()=>Math.floor(Math.random()*6)));setGuess([0,1,2,3]);setHistory([]);setEnded(false);};
  return <Panel title="MASTERMIND · CRACK THE CODE" score={history.length+"/8"} reset={reset}>
    <p className="retro-note">Find the hidden four-color code. Exact = right color and place. Misplaced = right color, wrong place. Repeats are allowed.</p>
    <div className="master-code">{guess.map((v,i)=><select key={i} aria-label={"Code slot "+(i+1)} value={v} disabled={ended} onChange={e=>setGuess(old=>old.map((x,j)=>j===i?Number(e.target.value):x))}>{CODE.map((color,j)=><option key={color} value={j}>COLOR {j+1}</option>)}</select>)}</div>
    <div className="master-swatches">{guess.map((v,i)=><i key={i} style={{background:CODE[v]}}/>)}</div>
    <button className="primary retro-submit" onClick={submit} disabled={ended}>SUBMIT GUESS</button>
    <div className="master-history">{history.map((row,i)=><div key={i}><span>{i+1}</span>{row.values.map((v,j)=><i key={j} style={{background:CODE[v]}}/>)}<b>{row.exact} exact · {row.misplaced} misplaced</b></div>)}</div>
    {ended&&<div className="result"><b>{history[history.length-1]?.exact===4?"CODE CRACKED":"CODE: "+secret.map(v=>v+1).join(" · ")}</b><button onClick={reset}>NEW CODE</button></div>}
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
  const tap=(index:number)=>{
    if(ended)return;
    if(selected===null){setSelected(index);return;}
    if(Math.abs(selected%7-index%7)+Math.abs(Math.floor(selected/7)-Math.floor(index/7))!==1){setSelected(index);return;}
    const next=board.map(row=>[...row]),ar=Math.floor(selected/7),ac=selected%7,br=Math.floor(index/7),bc=index%7;
    [next[ar][ac],next[br][bc]]=[next[br][bc],next[ar][ac]];
    if(!findGemMatches(next).size){setSelected(null);return;}
    const resolved=resolveGemCascades(next);
    const total=score+resolved.cleared*20,left=moves-1;
    setBoard(ensurePlayableGemBoard(resolved.board));setScore(total);setMoves(left);setSelected(null);
    if(total>=600){setEnded(true);done(total,true);}else if(left===0){setEnded(true);done(total,false);}
  };
  const reset=()=>{setBoard(createGemBoard());setSelected(null);setScore(0);setMoves(25);setEnded(false);};
  return <Panel title="GEM MATCH · THREE IN A ROW" score={score} reset={reset}>
    <p className="retro-note">Swap neighboring gems to match three or more. Reach 600 points within 25 moves.</p>
    <div className="match-meta"><span>{moves} MOVES LEFT</span><b>TARGET 600</b></div>
    <div className="match-board">{board.flatMap((row,r)=>row.map((gem,c)=><button key={r*7+c} className={"gem gem-"+GEMS[gem]+(selected===r*7+c?" selected":"")} onClick={()=>tap(r*7+c)} aria-label={"Row "+(r+1)+", column "+(c+1)}/>))}</div>
    {ended&&<div className="result"><b>{score>=600?"TARGET REACHED":"FINAL SCORE: "+score}</b><button onClick={reset}>PLAY AGAIN</button></div>}
  </Panel>;
}

const MAZE=["#########","#   #   #","# # # # #","# #   # #","# ### # #","#   K   #","### # ###","#      E#","#########"];
function MazeRunner({done}:{done:Done}){
  const [player,setPlayer]=useState(10),[keyFound,setKeyFound]=useState(false),[moves,setMoves]=useState(0),[ended,setEnded]=useState(false);
  const walls=new Set(MAZE.join("").split("").flatMap((v,i)=>v==="#"?[i]:[])),key=MAZE.join("").indexOf("K"),exit=MAZE.join("").indexOf("E");
  const move=useCallback((delta:number)=>{if(ended)return;const next=player+delta;if(walls.has(next)||next<0||next>=81||(delta===1&&player%9===8)||(delta===-1&&player%9===0))return;setPlayer(next);setMoves(v=>v+1);if(next===key)setKeyFound(true);if(next===exit&&keyFound){setEnded(true);done(Math.max(100,800-moves*8),true);}},[done,ended,exit,key,keyFound,moves,player,walls]);
  useEffect(()=>{const keydown=(e:KeyboardEvent)=>{const d:Record<string,number>={ArrowUp:-9,w:-9,ArrowDown:9,s:9,ArrowLeft:-1,a:-1,ArrowRight:1,d:1};if(d[e.key]!==undefined){e.preventDefault();move(d[e.key]);}};window.addEventListener("keydown",keydown);return()=>window.removeEventListener("keydown",keydown);},[move]);
  const reset=()=>{setPlayer(10);setKeyFound(false);setMoves(0);setEnded(false);};
  return <Panel title="MAZE RUNNER · FIND THE KEY" score={moves} reset={reset}>
    <p className="retro-note">Find the key, then reach the exit. Dead ends are still dead ends.</p>
    <div className="maze-board">{MAZE.join("").split("").map((v,i)=><span key={i} className={["maze-cell",v==="#"?"wall":"",v==="K"&&!keyFound?"key-cell":"",v==="E"?"exit-cell":"",player===i?"runner":""].join(" ")}>{player===i?"●":v==="K"&&!keyFound?"◆":v==="E"?"⇧":""}</span>)}</div>
    <div className="retro-status">{keyFound?"KEY ACQUIRED · FIND THE EXIT":"KEY NOT FOUND"}</div>
    <div className="retro-pad"><button onClick={()=>move(-9)}>↑</button><div><button onClick={()=>move(-1)}>←</button><button onClick={()=>move(9)}>↓</button><button onClick={()=>move(1)}>→</button></div></div>
    {ended&&<div className="result"><b>MAZE CLEARED</b><button onClick={reset}>RUN AGAIN</button></div>}
  </Panel>;
}

export function RetroGame({id,onFinish}:Props){
  const done=useCallback((score:number,won:boolean,draw=false)=>onFinish(id,score,won,draw),[id,onFinish]);
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
