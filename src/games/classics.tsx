import { useCallback,useEffect,useRef,useState } from "react";
import { Activity,Play,RotateCcw } from "lucide-react";
import { Memory,XO,Reflex } from "./extra";
import type { GameId } from "../types/game";
import { has2048Moves, move2048, type PuzzleDirection } from "./puzzleLogic";
export type { GameId } from "../types/game";
type Props={id:GameId;onFinish:(id:GameId,score:number,won:boolean,draw?:boolean)=>void};
type CallbackProps={onFinish:(id:GameId,score:number,won:boolean,draw?:boolean)=>void};
export function ClassicGame({id,onFinish}:Props){if(id==="snake")return <Snake onFinish={onFinish}/>;if(id==="2048")return <Puzzle onFinish={onFinish}/>;if(id==="memory")return <Memory onFinish={onFinish}/>;if(id==="xo")return <XO onFinish={onFinish}/>;return <Reflex onFinish={onFinish}/>;}
function Toolbar({label,score}:{label:string;score:number}){return <div className="game-toolbar"><span className="game-live"><i/> {label}</span><span className="game-score">SCORE <b>{score}</b></span></div>;}
type Point={x:number;y:number};
function Snake({onFinish}:CallbackProps){
 const initialBody:Point[]=[{x:7,y:8},{x:6,y:8},{x:5,y:8}];
 const initialFood:Point={x:11,y:8};
 const [body,setBody]=useState<Point[]>(initialBody);
 const [food,setFood]=useState<Point>(initialFood);
 const [running,setRunning]=useState(false);
 const [over,setOver]=useState(false);
 const [score,setScore]=useState(0);
 const bodyRef=useRef(body);
 const foodRef=useRef(food);
 const directionRef=useRef<Point>({x:1,y:0});
 const scoreRef=useRef(0);
 const finishedRef=useRef(false);
 const finishRef=useRef(onFinish);
 finishRef.current=onFinish;

 const spawn=(segments:Point[]):Point|null=>{
  const occupied=new Set(segments.map(point=>point.y*16+point.x));
  const empty=Array.from({length:256},(_,index)=>index).filter(index=>!occupied.has(index));
  if(!empty.length)return null;
  const index=empty[Math.floor(Math.random()*empty.length)];
  return{x:index%16,y:Math.floor(index/16)};
 };
 const changeDirection=(next:Point)=>{
  const current=directionRef.current;
  if(next.x===-current.x&&next.y===-current.y)return;
  directionRef.current=next;
  setRunning(true);
 };

 const reset=()=>{
  const nextBody=[...initialBody];
  bodyRef.current=nextBody;
  foodRef.current=initialFood;
  directionRef.current={x:1,y:0};
  scoreRef.current=0;
  finishedRef.current=false;
  setBody(nextBody);
  setFood(initialFood);
  setScore(0);
  setOver(false);
  setRunning(false);
 };

 useEffect(()=>{
  const handler=(event:KeyboardEvent)=>{
   const directions:Record<string,Point>={
    ArrowUp:{x:0,y:-1},w:{x:0,y:-1},
    ArrowDown:{x:0,y:1},s:{x:0,y:1},
    ArrowLeft:{x:-1,y:0},a:{x:-1,y:0},
    ArrowRight:{x:1,y:0},d:{x:1,y:0},
   };
   const next=directions[event.key];
   if(!next||finishedRef.current)return;
   event.preventDefault();
   changeDirection(next);
  };
  window.addEventListener("keydown",handler);
  return()=>window.removeEventListener("keydown",handler);
 },[]);

 useEffect(()=>{
  if(!running||over)return;
  const timer=window.setInterval(()=>{
   if(finishedRef.current)return;
   const current=bodyRef.current;
   const head={x:current[0].x+directionRef.current.x,y:current[0].y+directionRef.current.y};
   const ate=head.x===foodRef.current.x&&head.y===foodRef.current.y;
   const collisionBody=ate?current:current.slice(0,-1);
   if(head.x<0||head.x>15||head.y<0||head.y>15||collisionBody.some(point=>point.x===head.x&&point.y===head.y)){
    finishedRef.current=true;
    setRunning(false);
    setOver(true);
    finishRef.current("snake",scoreRef.current,false);
    return;
   }

   const nextBody=[head,...current].slice(0,ate?current.length+1:current.length);
   bodyRef.current=nextBody;
   setBody(nextBody);
   if(!ate)return;

   const nextScore=scoreRef.current+10;
   scoreRef.current=nextScore;
   setScore(nextScore);
   if(nextBody.length===256){
    finishedRef.current=true;
    setRunning(false);
    setOver(true);
    finishRef.current("snake",nextScore,true);
    return;
   }
   const nextFood=spawn(nextBody);
   if(nextFood){
    foodRef.current=nextFood;
    setFood(nextFood);
   }
  },Math.max(75,150-score));
  return()=>window.clearInterval(timer);
 },[running,over,score]);

 return <div className="engine"><Toolbar label={over?"RUN ENDED":running?"IN PROGRESS":"READY TO PLAY"} score={score}/><div className="snake-board">{Array.from({length:256},(_,i)=>{const x=i%16,y=Math.floor(i/16),n=body.findIndex(point=>point.x===x&&point.y===y);return <div key={i} className={`snake-cell ${n===0?"snake-head":n>0?"snake-body":food.x===x&&food.y===y?"snake-food":""}`}/>;})}</div><div className="mobile-game-controls" aria-label="Snake controls"><button onClick={()=>changeDirection({x:0,y:-1})}>↑</button><div><button onClick={()=>changeDirection({x:-1,y:0})}>←</button><button onClick={()=>changeDirection({x:0,y:1})}>↓</button><button onClick={()=>changeDirection({x:1,y:0})}>→</button></div></div>{!running&&<div className="game-overlay"><div className="overlay-panel"><Activity className="overlay-icon"/><h2>{over?"RUN COMPLETE":"READY?"}</h2><p>{over?`You scored ${score} points. Try again.`:"Collect energy dots. Avoid walls and your own trail."}</p><button className="primary" onClick={over?reset:()=>setRunning(true)}>{over?<RotateCcw/>:<Play/>}{over?"PLAY AGAIN":"START RUN"}</button></div></div>}</div>;
}

type Board=number[];
const spawn=(b:Board):Board=>{const empty=b.map((v,i)=>v===0?i:-1).filter(i=>i>=0);if(!empty.length)return b;const n=[...b];n[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4;return n;};
function Puzzle({onFinish}:CallbackProps){
 const [board,setBoard]=useState<Board>(()=>spawn(spawn(Array(16).fill(0))));const [score,setScore]=useState(0);const [status,setStatus]=useState<"playing"|"won"|"over">("playing");const wonRef=useRef(false);
 const move=useCallback((dir:PuzzleDirection)=>{if(status==="over")return;const result=move2048(board,dir);if(!result.changed)return;const b=spawn(result.board),total=score+result.score;setBoard(b);setScore(total);const reachedGoal=b.includes(2048)&&!wonRef.current;const noMoves=!has2048Moves(b);if(reachedGoal){wonRef.current=true;setStatus("won");}if(noMoves){setStatus("over");onFinish("2048",total,wonRef.current);}},[board,status,score,onFinish]);
 useEffect(()=>{const h=(e:KeyboardEvent)=>{const m:Record<string,PuzzleDirection>={ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right",ArrowUp:"up",w:"up",ArrowDown:"down",s:"down"};if(m[e.key]){e.preventDefault();move(m[e.key]);}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[move]);
 const reset=()=>{wonRef.current=false;setBoard(spawn(spawn(Array(16).fill(0))));setScore(0);setStatus("playing");};
 return <div className="engine"><Toolbar label={status==="playing"?"MERGE THE TILES":status==="won"?"2048 REACHED":"NO MORE MOVES"} score={score}/><div className="board-2048" aria-label="2048 board">{board.map((v,i)=><div key={i} className={`tile tile-${Math.min(v,2048)}`}>{v||""}</div>)}</div><div className="mobile-game-controls" aria-label="2048 controls"><button onClick={()=>move("up")}>↑</button><div><button onClick={()=>move("left")}>←</button><button onClick={()=>move("down")}>↓</button><button onClick={()=>move("right")}>→</button></div></div><div className="game-action-row"><button className="secondary" onClick={reset}><RotateCcw size={14}/> NEW GAME</button><span>ARROWS / WASD TO MOVE</span></div>{status==="won"&&<div className="result"><b>2048 REACHED. KEEP GOING?</b><button onClick={()=>setStatus("playing")}>KEEP PLAYING</button><button onClick={reset}>NEW GAME</button></div>}{status==="over"&&<div className="result"><b>NO MORE MOVES.</b><button onClick={reset}>PLAY AGAIN</button></div>}</div>;
}
