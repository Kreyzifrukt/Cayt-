import { Activity, Award, Bolt, Brain, Crown, Gamepad2, Heart, Shield, Target, Trophy, Zap, Play, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { GameId } from "./games";
export type Save={xp:number;played:number;wins:number;best:Record<string,number>;favorites:string[];sound:boolean};
export const games=[
{id:"snake" as const,title:"NEON SNAKE",genre:"ARCADE",description:"One more apple. One more point. Don't hit yourself.",icon:Activity,color:"mint",level:"CLASSIC"},
{id:"2048" as const,title:"2048",genre:"PUZZLE",description:"Merge tiles, plan ahead, reach the legendary tile.",icon:Brain,color:"violet",level:"STRATEGY"},
{id:"memory" as const,title:"MEMORY MATRIX",genre:"BRAIN",description:"Train your focus. Match every pair with fewer moves.",icon:Bolt,color:"pink",level:"FOCUS"},
{id:"xo" as const,title:"XO ARENA",genre:"DUEL",description:"A tiny board. A surprisingly stubborn opponent.",icon:Target,color:"blue",level:"TACTICAL"},
{id:"reflex" as const,title:"REFLEX RUSH",genre:"REACTION",description:"Wait for green. React faster than your excuses.",icon:Zap,color:"orange",level:"SPEED"}
];
export function Stat({icon,label,value}:{icon:ReactNode;label:string;value:number}){return <div className="stat"><span>{icon}</span><div><small>{label}</small><b>{value.toLocaleString()}</b></div></div>;}
export function Dashboard({save,level,launch,favorite}:{save:Save;level:number;launch:(id:GameId)=>void;favorite:(id:string)=>void}){
 return <section className="content"><div className="welcome"><div><div className="eyebrow"><i/> WELCOME BACK, PLAYER</div><h1>Ready to <em>play?</em></h1><p>Your next personal best is one game away.</p></div><span className="ready">◷ YOUR ARCADE IS READY</span></div>
 <div className="hero"><div className="hero-grid"/><div className="hero-copy"><div className="featured"><i/> FEATURED GAME</div><h2>ENTER THE<br/><em>NEON GRID.</em></h2><p>Fast moves. Clean lines. A high score waiting to happen.</p><button className="primary" onClick={()=>launch("snake")}><Play size={15} fill="currentColor"/> PLAY SNAKE <ArrowRight size={15}/></button></div><div className="hero-art"><div className="orbit one"/><div className="orbit two"/><div className="snake-art"><i/><i/><i/><i/><i/><i/><b/></div><div className="hero-score">001<small>HIGH SCORE</small></div></div><span className="hero-count">01 <small>/ 05</small></span></div>
 <div className="stats-strip"><Stat icon={<Gamepad2/>} label="GAMES PLAYED" value={save.played}/><Stat icon={<Trophy/>} label="VICTORIES" value={save.wins}/><Stat icon={<Crown/>} label="PLAYER LEVEL" value={level}/><Stat icon={<Award/>} label="BEST SCORE" value={Math.max(0,...Object.values(save.best))}/></div>
 <div className="section-heading"><div><div className="eyebrow">PICK YOUR CHALLENGE</div><h2>THE ARCADE <small>/ 05</small></h2></div><span>● ALL SYSTEMS READY</span></div>
 <div className="game-grid">{games.map((g,i)=><article className={`game-card ${g.color}`} key={g.id}><div className="card-top"><small>0{i+1} / GAME</small><button onClick={()=>favorite(g.id)} aria-label="Toggle favorite"><Heart size={16} fill={save.favorites.includes(g.id)?"currentColor":"none"}/></button></div><div className="game-art"><div className="glow"/><g.icon/></div><div className="card-info"><div className="meta"><span>{g.genre}</span><small>{g.level}</small></div><h3>{g.title}</h3><p>{g.description}</p><div className="card-bottom"><small>BEST <b>{save.best[g.id]||0}</b></small><button onClick={()=>launch(g.id)}>PLAY <ArrowRight size={14}/></button></div></div></article>)}</div>
 <div className="callout"><Shield/><div><b>YOUR PROGRESS STAYS YOURS.</b><p>Scores, XP and favorites are saved locally on this device. No account. No nonsense.</p></div><span>✓ LOCAL-FIRST</span></div></section>;
}
