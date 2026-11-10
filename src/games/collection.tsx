import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import type { GameId } from "../types/game";
import { randomDifferentIndex } from "./gameUtils";
import { appendSimonInput } from "./simonLogic";
import { revealSafeCells } from "./minesweeperLogic";
import { canPlaceTetromino, getTetrominoBlocks, rotateTetromino, TETROMINOES } from "./tetrisLogic";

type Props = { id: Extract<GameId, "minesweeper" | "tetris" | "breakout" | "pong" | "simon" | "hangman" | "connect-four" | "whack-a-mole" | "math-sprint" | "color-clash" | "pattern-recall" | "higher-lower" | "typing-rush" | "number-hunt" | "mini-sudoku">; onFinish: (id: GameId, score: number, won: boolean, draw?: boolean) => void };
function Frame({ title, score, children, reset }: { title: string; score: number | string; children: ReactNode; reset: () => void }) {
  return <div className="engine collection-engine"><div className="game-toolbar"><span className="game-live"><i/> {title}</span><span className="game-score">SCORE <b>{score}</b></span></div>{children}<div className="collection-footer"><button className="secondary" onClick={reset}><RotateCcw size={14}/> RESTART</button><span>NEON ARCADE · LOCAL SESSION</span></div></div>;
}
function Minesweeper({ done }: { done: (s:number,w:boolean)=>void }) {
  const createMines=()=>{const a=new Set<number>();while(a.size<10)a.add(Math.floor(Math.random()*64));return a;};
  const [mines,setMines]=useState<Set<number>>(createMines);const [open,setOpen]=useState<number[]>([]);const [flags,setFlags]=useState<number[]>([]);const [lost,setLost]=useState(false);const [complete,setComplete]=useState(false);const [flagMode,setFlagMode]=useState(false);const [firstMove,setFirstMove]=useState(true);
  const neighbors=(i:number)=>Array.from({length:64},(_,n)=>n).filter(n=>Math.abs(n%8-i%8)<=1&&Math.abs(Math.floor(n/8)-Math.floor(i/8))<=1&&n!==i);
  const count=(i:number,field:Set<number>=mines)=>neighbors(i).filter(n=>field.has(n)).length;
  const reveal=(i:number)=>{if(lost||complete||open.includes(i)||flags.includes(i))return;let activeMines=mines;if(firstMove){setFirstMove(false);if(mines.has(i)){activeMines=new Set(mines);activeMines.delete(i);let replacement=Math.floor(Math.random()*64);while(replacement===i||activeMines.has(replacement))replacement=Math.floor(Math.random()*64);activeMines.add(replacement);setMines(activeMines);}}if(activeMines.has(i)){setLost(true);setOpen([...open,i]);done(open.length*10,false);return;}const next=revealSafeCells(i,new Set(open),new Set(flags),activeMines);setOpen([...next]);if(next.size===54){setComplete(true);done(1000,true);}};
  const reset=()=>{setMines(createMines());setOpen([]);setFlags([]);setLost(false);setComplete(false);setFlagMode(false);setFirstMove(true);};
  return <Frame title={lost?"MINE DETONATED":"MINESWEEPER · 10 MINES"} score={open.length} reset={reset}><div className="game-action-row"><button className="secondary" onClick={()=>setFlagMode(v=>!v)}>{flagMode?"FLAG MODE ON":"FLAG MODE OFF"}</button><span>10 MINES · 8×8</span></div><div className="mine-grid">{Array.from({length:64},(_,i)=><button key={i} className={open.includes(i)?"mine-cell revealed": "mine-cell"} onClick={()=>{if(lost||complete)return;if(flagMode){if(open.includes(i))return;setFlags(v=>v.includes(i)?v.filter(x=>x!==i):v.length<10?[...v,i]:v);}else reveal(i);}} onContextMenu={e=>{e.preventDefault();if(lost||complete||open.includes(i))return;setFlags(v=>v.includes(i)?v.filter(x=>x!==i):v.length<10?[...v,i]:v);}}>{open.includes(i)?(mines.has(i)?"✹":count(i)||""):flags.includes(i)?"⚑":""}</button>)}</div><p className="collection-note">Откройте все безопасные клетки. Правый клик или режим флага ставит отметку.</p>{lost&&<div className="result"><b>МИНА! Попробуйте ещё раз.</b></div>}{complete&&<div className="result"><b>FIELD CLEARED. NICE WORK.</b></div>}</Frame>;
}
function Tetris({ done }: { done:(s:number,w:boolean,draw?:boolean)=>void }) {
  const createBoard=()=>Array.from({length:20},()=>Array(10).fill(0));
  const createPiece=()=>({x:3,y:0,shape:TETROMINOES[0]});
  const [board,setBoard]=useState<number[][]>(createBoard);
  const [piece,setPiece]=useState(createPiece);
  const [score,setScore]=useState(0);
  const [over,setOver]=useState(false);
  const boardRef=useRef(board);
  const pieceRef=useRef(piece);
  const scoreRef=useRef(0);
  const overRef=useRef(false);
  const doneRef=useRef(done);
  doneRef.current=done;

  const moveHorizontal=(delta:number)=>{
    if(overRef.current)return;
    const current=pieceRef.current;
    const nextX=current.x+delta;
    if(!canPlaceTetromino(boardRef.current,current.shape,nextX,current.y))return;
    const next={...current,x:nextX};
    pieceRef.current=next;
    setPiece(next);
  };
  const rotate=()=>{
    if(overRef.current)return;
    const current=pieceRef.current;
    const rotated=rotateTetromino(current.shape);
    const offset=[0,-1,1,-2,2].find(dx=>canPlaceTetromino(boardRef.current,rotated,current.x+dx,current.y));
    if(offset===undefined)return;
    const next={...current,x:current.x+offset,shape:rotated};
    pieceRef.current=next;
    setPiece(next);
  };
  const tick=()=>{
    if(overRef.current)return;
    const current=pieceRef.current;
    const nextY=current.y+1;
    if(canPlaceTetromino(boardRef.current,current.shape,current.x,nextY)){
      const next={...current,y:nextY};
      pieceRef.current=next;
      setPiece(next);
      return;
    }

    const locked=boardRef.current.map(row=>[...row]);
    getTetrominoBlocks(current.shape,current.x,current.y).forEach(([x,y])=>{
      if(y>=0&&y<20&&x>=0&&x<10)locked[y][x]=1;
    });
    const kept=locked.filter(row=>row.some(value=>!value));
    const cleared=20-kept.length;
    while(kept.length<20)kept.unshift(Array(10).fill(0));
    const total=scoreRef.current+cleared*100;
    boardRef.current=kept;
    scoreRef.current=total;
    setBoard(kept);
    setScore(total);

    const nextPiece={x:3,y:0,shape:TETROMINOES[Math.floor(Math.random()*TETROMINOES.length)]};
    if(!canPlaceTetromino(kept,nextPiece.shape,nextPiece.x,nextPiece.y)){
      overRef.current=true;
      setOver(true);
      doneRef.current(total,false);
      return;
    }
    pieceRef.current=nextPiece;
    setPiece(nextPiece);
  };

  useEffect(()=>{
    if(over)return;
    const timer=window.setInterval(tick,650);
    return()=>window.clearInterval(timer);
  },[over]);

  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      if(event.key==="ArrowLeft"||event.key==="a"){event.preventDefault();moveHorizontal(-1);}
      else if(event.key==="ArrowRight"||event.key==="d"){event.preventDefault();moveHorizontal(1);}
      else if(event.key==="ArrowDown"||event.key==="s"){event.preventDefault();tick();}
      else if(event.key==="ArrowUp"||event.key==="w"){event.preventDefault();rotate();}
    };
    window.addEventListener("keydown",key);
    return()=>window.removeEventListener("keydown",key);
  },[]);

  const reset=()=>{
    const nextBoard=createBoard();
    const nextPiece=createPiece();
    boardRef.current=nextBoard;
    pieceRef.current=nextPiece;
    scoreRef.current=0;
    overRef.current=false;
    setBoard(nextBoard);
    setPiece(nextPiece);
    setScore(0);
    setOver(false);
  };
  const visibleBlocks=getTetrominoBlocks(piece.shape,piece.x,piece.y);
  return <Frame title={over?"STACK OVER":"TETRIS · ARROW KEYS"} score={score} reset={reset}>
    <div className="tetris-board" aria-label="Tetris playfield">{board.flatMap((row,y)=>row.map((value,x)=><span key={y*10+x} className={value||visibleBlocks.some(([bx,by])=>bx===x&&by===y)?"tetris-block":""}/>) )}</div>
    <div className="game-action-row"><button className="secondary" onClick={()=>moveHorizontal(-1)} disabled={over}>LEFT</button><button className="secondary" onClick={rotate} disabled={over}>ROTATE</button><button className="secondary" onClick={()=>moveHorizontal(1)} disabled={over}>RIGHT</button><button className="secondary" onClick={tick} disabled={over}>DOWN</button></div>
    {over&&<div className="result"><b>GAME OVER · {score} POINTS</b><button onClick={reset}>PLAY AGAIN</button></div>}
  </Frame>;
}

function Breakout({done}:{done:(s:number,w:boolean)=>void}) {
 const initialBall={x:4,y:8,dx:1,dy:-1};
 const initialBricks=Array.from({length:30},(_,i)=>i);
 const [paddle,setPaddle]=useState(4);
 const [ball,setBall]=useState(initialBall);
 const [bricks,setBricks]=useState(initialBricks);
 const [lost,setLost]=useState(false);
 const [won,setWon]=useState(false);
 const paddleRef=useRef(4);
 const ballRef=useRef(initialBall);
 const bricksRef=useRef(initialBricks);
 const lostRef=useRef(false);
 const wonRef=useRef(false);
 const doneRef=useRef(done);
 doneRef.current=done;

 useEffect(()=>{
  if(lost||won)return;
  const timer=window.setInterval(()=>{
   if(lostRef.current||wonRef.current)return;
   const current=ballRef.current;
   let x=current.x+current.dx;
   let y=current.y+current.dy;
   let dx=current.dx;
   let dy=current.dy;
   if(x<0){x=0;dx=1;}else if(x>9){x=9;dx=-1;}
   if(y<0){y=0;dy=1;}
   if(y>=11){
    if(Math.abs(x-paddleRef.current)<=1){y=10;dy=-1;}
    else{
     lostRef.current=true;
     setLost(true);
     doneRef.current(30,false);
     return;
    }
   }
   const hit=bricksRef.current.find(index=>Math.floor(index/10)===Math.floor(y/2)&&index%10===Math.round(x));
   if(hit!==undefined){
    const remaining=bricksRef.current.filter(index=>index!==hit);
    bricksRef.current=remaining;
    setBricks(remaining);
    dy=-dy;
    if(remaining.length===0){
     wonRef.current=true;
     setWon(true);
     const nextBall={x,y,dx,dy};
     ballRef.current=nextBall;
     setBall(nextBall);
     doneRef.current(500,true);
     return;
    }
   }
   const nextBall={x,y,dx,dy};
   ballRef.current=nextBall;
   setBall(nextBall);
  },180);
  return()=>window.clearInterval(timer);
 },[lost,won]);

 const movePaddle=(delta:number)=>{
  const next=Math.max(0,Math.min(9,paddleRef.current+delta));
  paddleRef.current=next;
  setPaddle(next);
 };
 useEffect(()=>{
  const handleKeyDown=(event:KeyboardEvent)=>{
   const key=event.key.toLowerCase();
   const delta=key==="arrowleft"||key==="a"?-1:key==="arrowright"||key==="d"?1:0;
   if(!delta||lostRef.current||wonRef.current)return;
   event.preventDefault();
   const next=Math.max(0,Math.min(9,paddleRef.current+delta));
   paddleRef.current=next;
   setPaddle(next);
  };
  window.addEventListener("keydown",handleKeyDown);
  return()=>window.removeEventListener("keydown",handleKeyDown);
 },[]);
 const reset=()=>{
  const nextBricks=Array.from({length:30},(_,i)=>i);
  paddleRef.current=4;
  ballRef.current=initialBall;
  bricksRef.current=nextBricks;
  lostRef.current=false;
  wonRef.current=false;
  setPaddle(4);
  setBall(initialBall);
  setBricks(nextBricks);
  setLost(false);
  setWon(false);
 };
 return <Frame title={won?"WALL DESTROYED":lost?"BALL LOST":"BREAKOUT · MOVE THE PADDLE"} score={30-bricks.length} reset={reset}>
  <div className="breakout-board">{Array.from({length:30},(_,i)=><i key={i} className={bricks.includes(i)?"brick":""}/>)}<span className="breakout-ball" style={{left:`${ball.x*10+5}%`,top:`${ball.y*8+4}%`}}/><span className="breakout-paddle" style={{left:`${paddle*10+5}%`}}/></div>
  <div className="game-action-row"><button className="secondary" onClick={()=>movePaddle(-1)} disabled={lost||won}>LEFT</button><button className="secondary" onClick={()=>movePaddle(1)} disabled={lost||won}>RIGHT</button></div>
  {(lost||won)&&<div className="result"><b>{won?"ALL BRICKS CLEARED.":"THE BALL GOT AWAY."}</b><button onClick={reset}>PLAY AGAIN</button></div>}
 </Frame>;
}
function Pong({done}:{done:(s:number,w:boolean)=>void}) {
 const initialBall={x:5,y:5,dx:1,dy:1};
 const [ball,setBall]=useState(initialBall);
 const [paddle,setPaddle]=useState(5);
 const [cpuPaddle,setCpuPaddle]=useState(5);
 const [player,setPlayer]=useState(0);
 const [cpu,setCpu]=useState(0);
 const [finished,setFinished]=useState(false);
 const ballRef=useRef(initialBall);
 const paddleRef=useRef(5);
 const cpuPaddleRef=useRef(5);
 const playerRef=useRef(0);
 const cpuRef=useRef(0);
 const finishedRef=useRef(false);
 const doneRef=useRef(done);
 doneRef.current=done;

 useEffect(()=>{
  if(finished)return;
  const timer=window.setInterval(()=>{
   if(finishedRef.current)return;
   const current=ballRef.current;
   let x=current.x+current.dx;
   let y=current.y+current.dy;
   let dx=current.dx;
   let dy=current.dy;
   let nextPlayer=playerRef.current;
   let nextCpu=cpuRef.current;
   if(y<=0){y=0;dy=1;}else if(y>=9){y=9;dy=-1;}
   if(x>=9){
    if(Math.abs(y-cpuPaddleRef.current)<=1){x=8;dx=-1;}
    else{nextPlayer+=1;x=5;y=5;dx=-1;}
   }else if(x<=0){
    if(Math.abs(y-paddleRef.current)<=1){x=1;dx=1;}
    else{nextCpu+=1;x=5;y=5;dx=1;}
   }
   if(nextPlayer!==playerRef.current){playerRef.current=nextPlayer;setPlayer(nextPlayer);}
   if(nextCpu!==cpuRef.current){cpuRef.current=nextCpu;setCpu(nextCpu);}
   let nextCpuPaddle=cpuPaddleRef.current;
   if(Math.abs(y-nextCpuPaddle)>1)nextCpuPaddle+=y>nextCpuPaddle?1:-1;
   nextCpuPaddle=Math.max(1,Math.min(9,nextCpuPaddle));
   cpuPaddleRef.current=nextCpuPaddle;
   setCpuPaddle(nextCpuPaddle);
   const nextBall={x,y,dx,dy};
   ballRef.current=nextBall;
   setBall(nextBall);
   if(nextPlayer>=5||nextCpu>=5){
    finishedRef.current=true;
    setFinished(true);
    doneRef.current(nextPlayer*100,nextPlayer>nextCpu);
   }
  },230);
  return()=>window.clearInterval(timer);
 },[finished]);

 const movePaddle=(delta:number)=>{
  if(finishedRef.current)return;
  const next=Math.max(1,Math.min(9,paddleRef.current+delta));
  paddleRef.current=next;
  setPaddle(next);
 };
 useEffect(()=>{
  const handleKeyDown=(event:KeyboardEvent)=>{
   const key=event.key.toLowerCase();
   const delta=key==="arrowup"||key==="w"?-1:key==="arrowdown"||key==="s"?1:0;
   if(!delta||finishedRef.current)return;
   event.preventDefault();
   const next=Math.max(1,Math.min(9,paddleRef.current+delta));
   paddleRef.current=next;
   setPaddle(next);
  };
  window.addEventListener("keydown",handleKeyDown);
  return()=>window.removeEventListener("keydown",handleKeyDown);
 },[]);
 const reset=()=>{
  ballRef.current=initialBall;
  paddleRef.current=5;
  cpuPaddleRef.current=5;
  playerRef.current=0;
  cpuRef.current=0;
  finishedRef.current=false;
  setBall(initialBall);
  setPaddle(5);
  setCpuPaddle(5);
  setPlayer(0);
  setCpu(0);
  setFinished(false);
 };
 return <Frame title="NEON PONG · FIRST TO 5" score={`${player} : ${cpu}`} reset={reset}>
  <div className="pong-board"><span className="pong-ball" style={{left:`${ball.x*10}%`,top:`${ball.y*10}%`}}/><i className="pong-you" style={{top:`${paddle*10}%`}}/><i className="pong-cpu" style={{top:`${cpuPaddle*10}%`}}/></div>
  <div className="game-action-row"><button className="secondary" onClick={()=>movePaddle(-1)} disabled={finished}>MOVE UP</button><button className="secondary" onClick={()=>movePaddle(1)} disabled={finished}>MOVE DOWN</button></div>
  {finished&&<div className="result"><b>{player>cpu?"YOU WIN":"CPU WINS"}</b><button onClick={reset}>REMATCH</button></div>}
 </Frame>;
}

function Simon({done}:{done:(s:number,w:boolean)=>void}) {
 const [sequence,setSequence]=useState<number[]>([]);const [input,setInput]=useState<number[]>([]);const [active,setActive]=useState(-1);const [started,setStarted]=useState(false);const [failed,setFailed]=useState(false);const [completed,setCompleted]=useState(false);const [playback,setPlayback]=useState(false);
 const timers=useRef<number[]>([]);
 const clearTimers=()=>{timers.current.forEach(timer=>window.clearTimeout(timer));timers.current=[];};
 useEffect(()=>()=>clearTimers(),[]);
 const show=(values:number[])=>{
  clearTimers();setPlayback(true);setActive(-1);
  values.forEach((value,index)=>{
   timers.current.push(window.setTimeout(()=>setActive(value),index*520));
   timers.current.push(window.setTimeout(()=>setActive(-1),index*520+300));
  });
  timers.current.push(window.setTimeout(()=>setPlayback(false),values.length*520));
 };
 const next=()=>{const s=[...sequence,Math.floor(Math.random()*4)];setSequence(s);setInput([]);show(s);};
 const begin=()=>{clearTimers();const first=Math.floor(Math.random()*4);setSequence([first]);setInput([]);setStarted(true);setFailed(false);setCompleted(false);show([first]);};
 const tap=(n:number)=>{if(!started||failed||playback)return;const result=appendSimonInput(sequence,input,n);if(result.kind==="ignored")return;if(result.kind==="mistake"){clearTimers();setFailed(true);setStarted(false);done(sequence.length*50,false);return;}setInput(result.input);if(result.kind==="complete"){if(sequence.length>=12){done(600,true);setStarted(false);setCompleted(true);}else{setPlayback(true);timers.current.push(window.setTimeout(next,500));}}};
 const reset=()=>{clearTimers();setSequence([]);setInput([]);setStarted(false);setFailed(false);setCompleted(false);setPlayback(false);setActive(-1);};
 return <Frame title="SIMON SAYS · REPEAT THE PATTERN" score={sequence.length} reset={reset}><div className="simon-grid">{[0,1,2,3].map(n=><button key={n} className={active===n?"simon-active":""} onClick={()=>tap(n)} disabled={!started||playback}/>)}</div>{!started||failed||completed?<div className="result"><b>{completed?"12 ROUNDS CLEARED":failed?"PATTERN BROKEN": "MEMORIZE THE LIGHTS"}</b><button onClick={begin}> {failed?"TRY AGAIN":"START"}</button></div>:<p className="collection-note">{playback?"Watch the sequence, then repeat it.":"Repeat the sequence."}</p>}</Frame>;
}
function Hangman({done}:{done:(s:number,w:boolean)=>void}) {
 const words=["ORBIT","PIXEL","VECTOR","NEBULA","CIRCUIT"];const [word,setWord]=useState(words[Math.floor(Math.random()*words.length)]);const [guessed,setGuessed]=useState<string[]>([]);const misses=guessed.filter(c=>!word.includes(c)).length;const won=word.split("").every(c=>guessed.includes(c));
 useEffect(()=>{if(won)done(500-misses*40,true);else if(misses>=6)done(100,false);},[won,misses,done]);
 const reset=()=>{setWord(words[Math.floor(Math.random()*words.length)]);setGuessed([]);};
 return <Frame title="HANGMAN · 6 MISTAKES MAX" score={`${misses}/6`} reset={reset}><div className="hang-word">{word.split("").map((c,i)=><b key={i}>{guessed.includes(c)?c:"_"}</b>)}</div><div className="letter-grid">{ "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(c=><button key={c} disabled={guessed.includes(c)||won||misses>=6} onClick={()=>setGuessed(v=>[...v,c])}>{c}</button>)}</div>{(won||misses>=6)&&<div className="result"><b>{won?"WORD SAVED":`WORD WAS ${word}`}</b><button onClick={reset}>NEXT WORD</button></div>}</Frame>;
}
function ConnectFour({done}:{done:(s:number,w:boolean,draw?:boolean)=>void}) {
 const [b,setB]=useState<(number|null)[]>(Array(42).fill(null));const [turn,setTurn]=useState(1);const [result,setResult]=useState("");
 const winner=(a:(number|null)[])=>{for(let r=0;r<6;r++)for(let c=0;c<7;c++){const i=r*7+c,v=a[i];if(v&&[[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>[1,2,3].every(k=>{const rr=r+dr*k,cc=c+dc*k;return rr>=0&&rr<6&&cc>=0&&cc<7&&a[rr*7+cc]===v;})))return v;}return 0;};
 const drop=(c:number)=>{if(result||!Array.from({length:6},(_,r)=>b[r*7+c]).some(v=>v===null))return;const n=[...b];for(let r=5;r>=0;r--)if(!n[r*7+c]){n[r*7+c]=1;break;}const w=winner(n);setB(n);if(w){setResult("YOU WIN");done(500,true);}else if(n.every(Boolean)){setResult("DRAW");done(30,false,true);}else{setTurn(2);const choices=[3,2,4,1,5,0,6].filter(col=>n[col]===null);const simulate=(col:number,mark:number)=>{const test=[...n];for(let row=5;row>=0;row--)if(!test[row*7+col]){test[row*7+col]=mark;break;}return winner(test);};const cc=choices.find(col=>simulate(col,2)===2)??choices.find(col=>simulate(col,1)===1)??choices[Math.floor(Math.random()*choices.length)]??3;for(let r=5;r>=0;r--)if(!n[r*7+cc]){n[r*7+cc]=2;break;}const cw=winner(n);setB(n);if(cw){setResult("CPU WINS");done(0,false);}else if(n.every(Boolean)){setResult("DRAW");done(30,false,true);}setTurn(1);}};
 return <Frame title="CONNECT FOUR · GET FOUR IN A ROW" score={turn===1?"YOUR TURN":"CPU"} reset={()=>{setB(Array(42).fill(null));setTurn(1);setResult("");}}><div className="connect-grid">{Array.from({length:7},(_,c)=><button key={c} className="drop-column" onClick={()=>drop(c)} disabled={!!result}>↓</button>)}{b.map((v,i)=><span key={i} className={v===1?"disc red":v===2?"disc yellow":"disc"}/>)}</div>{result&&<div className="result"><b>{result}</b><button onClick={()=>{setB(Array(42).fill(null));setTurn(1);setResult("");}}>REMATCH</button></div>}</Frame>;
}
function Whack({done}:{done:(s:number,w:boolean)=>void}) {
 const [time,setTime]=useState(20);const [target,setTarget]=useState(4);const [score,setScore]=useState(0);const [playing,setPlaying]=useState(false);const scoreRef=useRef(0);const deadline=useRef(0);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{const remaining=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setTime(remaining);if(remaining===0){setPlaying(false);done(scoreRef.current*20,scoreRef.current>=10);}},100);return()=>window.clearInterval(timer);},[playing,done]);
 return <Frame title="WHACK-A-MOLE · 20 SECONDS" score={score} reset={()=>{scoreRef.current=0;deadline.current=0;setTime(20);setScore(0);setPlaying(false);setTarget(4);}}><div className="tap-status"><span>TIME LEFT</span><b>{time}s</b></div><div className="tap-board">{Array.from({length:9},(_,i)=><button key={i} className={playing&&target===i?"tap-cell is-target":"tap-cell"} onClick={()=>{if(playing&&i===target&&Date.now()<deadline.current){const next=score+1;scoreRef.current=next;setScore(next);setTarget(v=>randomDifferentIndex(v,9));}}} disabled={!playing}/>)}</div>{!playing&&<div className="result"><b>{time===0?`FINAL SCORE: ${score}`:"HIT THE MOLE AS FAST AS YOU CAN"}</b><button onClick={()=>{scoreRef.current=0;deadline.current=Date.now()+20_000;setTime(20);setScore(0);setPlaying(true);setTarget(4);}}> {time===0?"PLAY AGAIN":"START"} </button></div>}</Frame>;
}
function MathSprint({done}:{done:(s:number,w:boolean)=>void}) {
 const [time,setTime]=useState(30);const [score,setScore]=useState(0);const [a,setA]=useState(7);const [b,setB]=useState(4);const [answer,setAnswer]=useState("");const [playing,setPlaying]=useState(false);const scoreRef=useRef(0);const deadline=useRef(0);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{const remaining=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setTime(remaining);if(remaining===0){setPlaying(false);done(scoreRef.current*15,scoreRef.current>=8);}},100);return()=>window.clearInterval(timer);},[playing,done]);
 const start=()=>{scoreRef.current=0;deadline.current=Date.now()+30_000;setTime(30);setScore(0);setAnswer("");setPlaying(true);};
 const reset=()=>{scoreRef.current=0;deadline.current=0;setTime(30);setScore(0);setPlaying(false);setAnswer("");};
 const submit=()=>{if(!playing||Date.now()>=deadline.current)return;if(Number(answer)===a+b){const next=score+1;scoreRef.current=next;setScore(next);}setA(2+Math.floor(Math.random()*18));setB(2+Math.floor(Math.random()*18));setAnswer("");};
 return <Frame title="MATH SPRINT · 30 SECONDS" score={score} reset={reset}><div className="math-question">{a} + {b} = ?</div><input className="collection-input" value={answer} onChange={e=>setAnswer(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&submit()} inputMode="numeric" disabled={!playing}/><div className="result"><b>{time}s LEFT</b><button onClick={()=>playing?submit():start()}>{playing?"SUBMIT":"START"}</button></div></Frame>;
}
function ColorClash({done}:{done:(s:number,w:boolean)=>void}) {
 const colors=[{name:"RED",hex:"#ff5577"},{name:"BLUE",hex:"#65a9ff"},{name:"GREEN",hex:"#69e5ae"},{name:"YELLOW",hex:"#f4d35e"}];const [word,setWord]=useState(0);const [ink,setInk]=useState(1);const [score,setScore]=useState(0);const [left,setLeft]=useState(15);const [playing,setPlaying]=useState(false);const ended=useRef(false);const scoreRef=useRef(0);const deadline=useRef(0);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{const remaining=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setLeft(remaining);if(remaining===0&&!ended.current){ended.current=true;setPlaying(false);done(scoreRef.current*20,scoreRef.current>=8);}},100);return()=>window.clearInterval(timer);},[playing,done]);
 const start=()=>{scoreRef.current=0;deadline.current=Date.now()+15_000;ended.current=false;setScore(0);setLeft(15);setPlaying(true);};
 const reset=()=>{scoreRef.current=0;deadline.current=0;ended.current=false;setPlaying(false);setScore(0);setLeft(15);setWord(0);setInk(1);};
 const pick=(n:number)=>{if(!playing||Date.now()>=deadline.current)return;const next=n===ink?score+1:Math.max(0,score-1);scoreRef.current=next;setScore(next);setWord(Math.floor(Math.random()*4));setInk(Math.floor(Math.random()*4));};
 return <Frame title="COLOR CLASH · PICK THE INK" score={score} reset={reset}><div className="color-word" style={{color:colors[ink].hex}}>{colors[word].name}</div><p className="collection-note">Choose the color of the letters, not the word.</p><div className="color-options">{colors.map((c,i)=><button key={c.name} onClick={()=>pick(i)} disabled={!playing} style={{borderColor:c.hex}}>{c.name}</button>)}</div><div className="tap-status"><span>TIME LEFT</span><b>{left}s</b></div><div className="result"><b>{playing?"MATCH THE INK COLOR":left===0?"ROUND COMPLETE":"READY?"}</b><button onClick={start} disabled={playing}>START ROUND</button></div></Frame>;
}
function PatternRecall({done}:{done:(s:number,w:boolean)=>void}) {
 const [pattern,setPattern]=useState<number[]>([]);const [picked,setPicked]=useState<number[]>([]);const [phase,setPhase]=useState<"ready"|"show"|"play"|"done">("ready");const [round,setRound]=useState(1);const [activeCell,setActiveCell]=useState(-1);const [won,setWon]=useState(false);
 const revealTimers=useRef<number[]>([]);
 const clearRevealTimers=()=>{revealTimers.current.forEach(timer=>window.clearTimeout(timer));revealTimers.current=[];};
 useEffect(()=>()=>clearRevealTimers(),[]);
 const start=()=>{clearRevealTimers();setWon(false);const p=Array.from({length:round+2},()=>Math.floor(Math.random()*16));setPattern(p);setPicked([]);setActiveCell(-1);setPhase("show");p.forEach((cell,index)=>{revealTimers.current.push(window.setTimeout(()=>setActiveCell(cell),index*520));revealTimers.current.push(window.setTimeout(()=>setActiveCell(-1),index*520+300));});revealTimers.current.push(window.setTimeout(()=>{setActiveCell(-1);setPhase("play");revealTimers.current=[];},p.length*520));};
 const pick=(n:number)=>{if(phase!=="play")return;const p=[...picked,n];setPicked(p);if(pattern[p.length-1]!==n){setPhase("done");setWon(false);done((round-1)*50,false);}else if(p.length===pattern.length){if(round===8){setPhase("done");setWon(true);done(500,true);}else{setRound(r=>r+1);setPhase("ready");}}};
 const reset=()=>{clearRevealTimers();setActiveCell(-1);setRound(1);setPattern([]);setPicked([]);setWon(false);setPhase("ready");};
 return <Frame title={`PATTERN RECALL · ROUND ${round}`} score={round-1} reset={reset}><div className="pattern-grid">{Array.from({length:16},(_,i)=><button key={i} className={phase==="show"&&activeCell===i?"pattern-lit":""} onClick={()=>pick(i)} disabled={phase!=="play"}/>)}</div><div className="result"><b>{phase==="show"?"MEMORIZE THE SEQUENCE":phase==="play"?"REPEAT IT":phase==="done"?(won?"8 ROUNDS CLEARED":"PATTERN FAILED"):"READY?"}</b><button onClick={start} disabled={phase==="show"||phase==="play"}>{phase==="done"?"RETRY":"START ROUND"}</button></div></Frame>;
}
function HigherLower({done}:{done:(s:number,w:boolean)=>void}) {
 const [current,setCurrent]=useState(7);const [next,setNext]=useState(0);const [streak,setStreak]=useState(0);const [over,setOver]=useState(false);
 const guess=(high:boolean)=>{if(over)return;const n=1+Math.floor(Math.random()*13);setNext(n);if(n===current)return;if((high&&n>current)||(!high&&n<current)){setStreak(s=>s+1);setCurrent(n);if(streak>=9){setOver(true);done(500,true);}}else{setOver(true);done(streak*40,false);}};
 return <Frame title="HIGHER OR LOWER · CARD GUESS" score={streak} reset={()=>{setCurrent(7);setNext(0);setStreak(0);setOver(false);}}><div className="card-number">{next||current}</div><p className="collection-note">Will the next card be higher or lower?</p><div className="game-action-row"><button className="secondary" onClick={()=>guess(false)} disabled={over}>LOWER</button><button className="secondary" onClick={()=>guess(true)} disabled={over}>HIGHER</button></div>{over&&<div className="result"><b>{streak} CORRECT GUESSES</b><button onClick={()=>{setCurrent(7);setNext(0);setStreak(0);setOver(false);}}>DEAL AGAIN</button></div>}</Frame>;
}
function TypingRush({done}:{done:(s:number,w:boolean)=>void}) {
 const text="THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG";const [value,setValue]=useState("");const [time,setTime]=useState(30);const [playing,setPlaying]=useState(false);const valueRef=useRef("");const deadline=useRef(0);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{const remaining=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setTime(remaining);if(remaining===0){setPlaying(false);done(valueRef.current.length*5,valueRef.current===text);}},100);return()=>window.clearInterval(timer);},[playing,done]);
 const start=()=>{valueRef.current="";deadline.current=Date.now()+30_000;setValue("");setTime(30);setPlaying(true);};
 const reset=()=>{valueRef.current="";deadline.current=0;setValue("");setTime(30);setPlaying(false);};
 const update=(raw:string)=>{if(!playing||Date.now()>=deadline.current)return;const next=raw.toUpperCase();if(!text.startsWith(next))return;valueRef.current=next;setValue(next);if(next===text){setPlaying(false);done(text.length*5,true);}};
 return <Frame title="TYPING RUSH · 30 SECONDS" score={value.length} reset={reset}><p className="typing-prompt">{text}</p><textarea className="collection-input" value={value} onChange={e=>update(e.target.value)} onPaste={e=>e.preventDefault()} disabled={!playing} placeholder="Start typing the sentence..." rows={3}/><div className="result"><b>{time}s LEFT</b><button onClick={start} disabled={playing}>{time===0?"FINISHED":"START"}</button></div></Frame>;
}
function NumberHunt({done}:{done:(s:number,w:boolean)=>void}) {
 const shuffleNumbers=()=>{const values=Array.from({length:100},(_,i)=>i+1);for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}return values;};
 const [numbers,setNumbers]=useState(shuffleNumbers);
 const [next,setNext]=useState(1);
 const [mistakes,setMistakes]=useState(0);
 const [complete,setComplete]=useState(false);
 const [started,setStarted]=useState(false);
 const [elapsed,setElapsed]=useState(0);
 const startedAt=useRef(0);
 useEffect(()=>{
  if(!started||complete)return;
  const timer=window.setInterval(()=>setElapsed(Math.floor((Date.now()-startedAt.current)/1000)),100);
  return()=>window.clearInterval(timer);
 },[started,complete]);
 const formatTime=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,"0")}:${(seconds%60).toString().padStart(2,"0")}`;
 const reset=()=>{setNumbers(shuffleNumbers());setNext(1);setMistakes(0);setComplete(false);setStarted(false);setElapsed(0);startedAt.current=0;};
 const pick=(n:number)=>{
  if(complete)return;
  if(!started){startedAt.current=Date.now();setStarted(true);}
  if(n===next){
   if(n===100){const seconds=startedAt.current?Math.floor((Date.now()-startedAt.current)/1000):0;setElapsed(seconds);setComplete(true);done(Math.max(0,1000-seconds*3-mistakes*5),true);}
   setNext(value=>value+1);
  }else setMistakes(value=>value+1);
 };
 return <Frame title="NUMBER HUNT · FIND 1 TO 100" score={next-1} reset={reset}>
  <div className="number-hunt-meta"><span>FOUND <b>{next-1}/100</b></span><span>TIME <b>{formatTime(elapsed)}</b></span><span>MISTAKES <b>{mistakes}</b></span></div>
  <p className="collection-note">Find the numbers in ascending order. The timer starts with your first tap.</p>
  <div className="number-grid" aria-label="Numbers from 1 to 100">{numbers.map(n=><button key={n} className={n<next?"number-found":""} disabled={complete||n<next} onClick={()=>pick(n)} aria-label={`Number ${n}`}>{n}</button>)}</div>
  {complete&&<div className="result"><b>ALL 100 FOUND · {formatTime(elapsed)} · {mistakes} MISTAKES</b><button onClick={reset}>PLAY AGAIN</button></div>}
 </Frame>;
}
function MiniSudoku({done}:{done:(s:number,w:boolean)=>void}) {
 const puzzle=[1,0,0,4,0,4,1,0,0,1,4,0,4,0,0,1];const solution=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1];const [values,setValues]=useState(puzzle);const [checked,setChecked]=useState(false);
 const set=(i:number,v:number)=>setValues(a=>a.map((n,j)=>i===j?v:n));
 const verify=()=>{if(checked||values.some(value=>value===0))return;const ok=values.every((v,i)=>v===solution[i]);setChecked(true);done(ok?500:100,ok);};
 return <Frame title="MINI SUDOKU · 4×4" score={values.filter((v,i)=>v&&puzzle[i]===0).length} reset={()=>{setValues(puzzle);setChecked(false);}}><div className="sudoku-grid">{values.map((v,i)=>puzzle[i]?<b key={i}>{v}</b>:<select key={i} value={v||""} disabled={checked} onChange={e=>set(i,Number(e.target.value))}><option value="">·</option>{[1,2,3,4].map(n=><option key={n}>{n}</option>)}</select>)}</div><div className="result"><b>{checked?"CHECK COMPLETE":"EACH ROW, COLUMN AND 2×2 BOX USES 1–4"}</b><button onClick={verify} disabled={checked||values.some(value=>value===0)}>CHECK SOLUTION</button></div></Frame>;
}
export function CollectionGame({id,onFinish}:Props) {
 const finishRef=useRef(onFinish);finishRef.current=onFinish;
 const complete=useCallback((score:number,won:boolean,draw=false)=>finishRef.current(id,score,won,draw),[id]);
 switch(id){
  case "minesweeper":return <Minesweeper done={complete}/>;
  case "tetris":return <Tetris done={complete}/>;
  case "breakout":return <Breakout done={complete}/>;
  case "pong":return <Pong done={complete}/>;
  case "simon":return <Simon done={complete}/>;
  case "hangman":return <Hangman done={complete}/>;
  case "connect-four":return <ConnectFour done={complete}/>;
  case "whack-a-mole":return <Whack done={complete}/>;
  case "math-sprint":return <MathSprint done={complete}/>;
  case "color-clash":return <ColorClash done={complete}/>;
  case "pattern-recall":return <PatternRecall done={complete}/>;
  case "higher-lower":return <HigherLower done={complete}/>;
  case "typing-rush":return <TypingRush done={complete}/>;
  case "number-hunt":return <NumberHunt done={complete}/>;
  case "mini-sudoku":return <MiniSudoku done={complete}/>;
  default:return null;
 }
}
