import { useState } from "react";
import { BarChart3,ChevronRight,Crown,Gamepad2,Home,Menu,Sparkles,Shield,Trophy,Volume2,VolumeX } from "lucide-react";
import { Game } from "./games";
import type { GameId } from "./types/game";
import { Dashboard,Stat,games } from "./components/dashboard";
import type { Save } from "./types/player";
import { usePlayerSave } from "./hooks/usePlayerSave";
export default function App(){
 const [save,setSave]=usePlayerSave();const [active,setActive]=useState<GameId|null>(null);const [stats,setStats]=useState(false);const [menu,setMenu]=useState(false);
 const level=Math.floor(save.xp/250)+1;
 const finish=(id:GameId,score:number,won:boolean)=>setSave(s=>({...s,xp:s.xp+Math.max(5,Math.round(score/5)+10),played:s.played+1,wins:s.wins+(won?1:0),best:{...s.best,[id]:Math.max(s.best[id]||0,score)}}));
 const launch=(id:GameId)=>{setActive(id);setStats(false);setMenu(false);};
 const selected=games.find(g=>g.id===active);
 return <div className="shell"><aside className={`sidebar ${menu?"open":""}`}>
 <button className="brand" onClick={()=>{setActive(null);setStats(false);}}><span className="brand-icon"><Gamepad2/></span><span>NEON<span className="brand-light">ARCADE</span><small>PLAY BEYOND LIMITS</small></span></button>
 <div className="side-label">YOUR SPACE</div><button className={!active&&!stats?"nav active":"nav"} onClick={()=>{setActive(null);setStats(false);}}><Home/> Dashboard</button><button className={stats?"nav active":"nav"} onClick={()=>{setStats(true);setActive(null);}}><BarChart3/> Statistics</button>
 <div className="side-label game-label">THE ARCADE <span>05</span></div>{games.map(g=><button key={g.id} className={active===g.id?"nav active":"nav"} onClick={()=>launch(g.id)}><g.icon/> {g.title}<ChevronRight className="nav-arrow"/></button>)}
 <div className="side-bottom"><div className="level-card"><div className="level-caption">PLAYER LEVEL <Crown size={14}/></div><strong>LVL {String(level).padStart(2,"0")}</strong><span>{save.xp} XP</span><div className="progress"><i style={{width:`${save.xp%250/2.5}%`}}/></div><small>{250-save.xp%250} XP TO NEXT LEVEL</small></div><div className="profile"><div className="avatar">P1</div><div><b>PLAYER ONE</b><small>ROOKIE EXPLORER</small></div><button className="sound" onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?<Volume2/>:<VolumeX/>}</button></div></div></aside>
 {menu&&<button className="scrim" onClick={()=>setMenu(false)} aria-label="Close menu"/>}
 <main className="main"><header className="topbar"><button className="menu-button" onClick={()=>setMenu(true)}><span>☰</span></button><div className="crumb">ARCADE <span>/</span> {selected?.title||(stats?"STATISTICS":"DASHBOARD")}</div><div className="top-right"><span className="online"><i/> SYSTEM ONLINE</span><span className="xp"><Sparkles size={15}/> {save.xp.toLocaleString()} XP</span></div></header>
 {selected?<section className="game-page"><button className="back" onClick={()=>setActive(null)}>← BACK TO ARCADE</button><div className="game-title"><div><div className="eyebrow">{selected.genre} / {selected.level}</div><h1>{selected.title}</h1><p>{selected.description}</p></div><div className="best"><Trophy/><span>PERSONAL BEST</span><b>{(save.best[active!]||0).toLocaleString()}</b></div></div><div className="playfield"><Game key={active} id={active!} onFinish={finish}/></div><div className="hint">ⓘ {active==="snake"||active==="2048"?"Use arrow keys or WASD to play":active==="memory"?"Select two cards to find a matching pair":active==="xo"?"You are X. The computer is O.":"Wait for green, then click as fast as you can."}</div></section>
 :stats?<section className="content"><div className="eyebrow">PLAYER PERFORMANCE</div><h1 className="page-title">YOUR <em>RECORD.</em></h1><p className="sub">Every run counts. Every retry is data.</p><div className="stats-grid"><Stat icon={<Gamepad2/>} label="TOTAL RUNS" value={save.played}/><Stat icon={<Trophy/>} label="VICTORIES" value={save.wins}/><Stat icon={<Crown/>} label="PLAYER LEVEL" value={level}/><Stat icon={<Sparkles/>} label="TOTAL XP" value={save.xp}/></div><div className="records"><div className="record-head"><b>PERSONAL BESTS</b><span>ALL-TIME RECORDS</span></div>{games.map(g=><div className="record" key={g.id}><span className={`record-icon ${g.color}`}><g.icon/></span><b>{g.title}</b><div className="bar"><i style={{width:`${Math.min(100,(save.best[g.id]||0)/Math.max(1,...Object.values(save.best))*100)}%`}}/></div><strong>{save.best[g.id]||0}</strong></div>)}</div><p className="privacy"><Shield/> Stats stay in this browser. Clearing site data resets your profile.</p></section>
 :<Dashboard save={save} level={level} launch={launch} favorite={id=>setSave(s=>({...s,favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]}))}/>}
 <footer className="footer"><span>NEON ARCADE <b>•</b> BUILT FOR THE NEXT HIGH SCORE</span><span>LOCAL SAVE ENABLED <i/></span></footer></main></div>;
}
