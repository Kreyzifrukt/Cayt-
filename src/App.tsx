import { useEffect, useState } from "react";
import { BarChart3, ChevronRight, Crown, Gamepad2, Home, Menu, Sparkles, Shield, Trophy, Volume2, VolumeX, Settings, Download, Upload, Maximize2, Star, Award, Medal, RotateCcw, Play } from "lucide-react";
import { Game } from "./games";
import type { GameId } from "./types/game";
import { Dashboard, Stat, games } from "./components/dashboard";
import type { Save } from "./types/player";
import { DEFAULT_SAVE } from "./types/player";
import { normalizeSave } from "./services/storage/playerStorage";
import { usePlayerSave } from "./hooks/usePlayerSave";

function todayKey() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
}
export default function App() {
  const [save,setSave]=usePlayerSave();
  const [active,setActive]=useState<GameId|null>(null);
  const [stats,setStats]=useState(false);
  const [settings,setSettings]=useState(false);
  const [menu,setMenu]=useState(false);
  const level=Math.floor(save.xp/250)+1;
  useEffect(()=>{if(save.dailyDate!==todayKey())setSave(s=>({...s,dailyDate:todayKey(),dailyRuns:0,dailyClaimed:false}));},[save.dailyDate,setSave]);
  const finish=(id:GameId,score:number,won:boolean)=>{
    if(save.sound){try{const context=new AudioContext();const oscillator=context.createOscillator();const gain=context.createGain();oscillator.type="sine";oscillator.frequency.value=won?880:260;gain.gain.setValueAtTime(0.035,context.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,context.currentTime+0.18);oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+0.18);oscillator.onended=()=>void context.close();}catch{/* Audio is optional and may be unavailable. */}}
    setSave(s=>{
      const fresh=s.dailyDate===todayKey()?s:{...s,dailyDate:todayKey(),dailyRuns:0,dailyClaimed:false};
      const runs=fresh.dailyRuns+1;
      const reward=runs===3&&!fresh.dailyClaimed;
      return {...fresh,xp:fresh.xp+Math.max(5,Math.round(score/5)+10)+(reward?50:0),
        coins:fresh.coins+Math.max(1,Math.floor(score/100))+(reward?25:0),
        played:fresh.played+1,wins:fresh.wins+(won?1:0),dailyRuns:runs,dailyClaimed:fresh.dailyClaimed||reward,
        best:{...fresh.best,[id]:Math.max(fresh.best[id]||0,score)}};
    });
  };
  const launch=(id:GameId)=>{setActive(id);setStats(false);setSettings(false);setMenu(false);};
  const selected=games.find(g=>g.id===active);
  const exportSave=()=>{
    const blob=new Blob([JSON.stringify(save,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");
    link.href=url;link.download="neon-arcade-save.json";link.click();URL.revokeObjectURL(url);
  };
  const importSave=(file:File)=>{
    file.text().then(raw=>{const parsed:unknown=JSON.parse(raw);setSave(normalizeSave(parsed));})
      .catch(()=>window.alert("Backup file is invalid or damaged."));
  };
  const resetSave=()=>{
    if(window.confirm("Reset all local progress, records, favorites and profile settings? This cannot be undone."))setSave({...DEFAULT_SAVE,dailyDate:todayKey()});
  };
  const skins=[{id:"mint",name:"NEON MINT",price:0},{id:"violet",name:"VIOLET PULSE",price:100},{id:"ember",name:"EMBER CORE",price:125},{id:"ice",name:"ARCTIC GLOW",price:150}] as const;
  const achievements=[
    {name:"FIRST STEPS",description:"Play your first game",unlocked:save.played>=1,icon:<Play/>},
    {name:"ARCADE REGULAR",description:"Complete 25 games",unlocked:save.played>=25,icon:<Gamepad2/>},
    {name:"WINNER'S CIRCLE",description:"Win 10 games",unlocked:save.wins>=10,icon:<Trophy/>},
    {name:"LEVEL FIVE",description:"Reach player level 5",unlocked:level>=5,icon:<Crown/>},
    {name:"COLLECTOR",description:"Favorite 5 games",unlocked:save.favorites.length>=5,icon:<Star/>},
    {name:"FULL HOUSE",description:"Set a record in 10 games",unlocked:Object.keys(save.best).filter(k=>(save.best as Record<string,number>)[k]>0).length>=10,icon:<Medal/>},
    {name:"NEON LEGEND",description:"Earn 5,000 XP",unlocked:save.xp>=5000,icon:<Award/>},
  ];
  return <div className={["shell",save.theme==="light"?"light-theme":"",save.skin!=="mint"?`skin-${save.skin}`:""].filter(Boolean).join(" ")}>
    <aside className={`sidebar ${menu?"open":""}`}>
      <button className="brand" onClick={()=>{setActive(null);setStats(false);setSettings(false);}}><span className="brand-icon"><Gamepad2/></span><span>NEON<span className="brand-light">ARCADE</span><small>PLAY BEYOND LIMITS</small></span></button>
      <div className="side-label">YOUR SPACE</div>
      <button className={!active&&!stats&&!settings?"nav active":"nav"} onClick={()=>{setActive(null);setStats(false);setSettings(false);}}><Home/> Dashboard</button>
      <button className={stats?"nav active":"nav"} onClick={()=>{setStats(true);setActive(null);setSettings(false);}}><BarChart3/> Statistics</button>
      <button className={settings?"nav active":"nav"} onClick={()=>{setSettings(true);setStats(false);setActive(null);}}><Settings/> Settings</button>
      <div className="side-label game-label">THE ARCADE <span>{String(games.length).padStart(2,"0")}</span></div>
      <div className="sidebar-games">{games.map(g=><button key={g.id} className={active===g.id?"nav active":"nav"} onClick={()=>launch(g.id)}><g.icon/> {g.title}<ChevronRight className="nav-arrow"/></button>)}</div>
      <div className="side-bottom"><div className="level-card"><div className="level-caption">PLAYER LEVEL <Crown size={14}/></div><strong>LVL {String(level).padStart(2,"0")}</strong><span>{save.xp} XP</span><div className="progress"><i style={{width:`${save.xp%250/2.5}%`}}/></div><small>{250-save.xp%250} XP TO NEXT LEVEL</small></div><div className="profile"><div className="avatar">{save.profileName.slice(0,2).toUpperCase()}</div><div><b>{save.profileName.toUpperCase()}</b><small>{save.coins} COINS</small></div><button className="sound" aria-label="Toggle sound" onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?<Volume2/>:<VolumeX/>}</button></div></div>
    </aside>
    {menu&&<button className="scrim" onClick={()=>setMenu(false)} aria-label="Close menu"/>}
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={()=>setMenu(true)}><span>☰</span></button><div className="crumb">ARCADE <span>/</span> {selected?.title||(stats?"STATISTICS":settings?"SETTINGS":"DASHBOARD")}</div><div className="top-right"><span className="online"><i/> SYSTEM ONLINE</span><span className="xp"><Sparkles size={15}/> {save.xp.toLocaleString()} XP · {save.coins} COINS</span></div></header>
      {selected?<section className="game-page"><button className="back" onClick={()=>setActive(null)}>← BACK TO ARCADE</button><div className="game-title"><div><div className="eyebrow">{selected.genre} / {selected.level}</div><h1>{selected.title}</h1><p>{selected.description}</p></div><div className="best"><Trophy/><span>PERSONAL BEST</span><b>{(save.best[active!]||0).toLocaleString()}</b></div></div><div className="game-toolbar-actions"><button className="secondary" onClick={()=>document.querySelector(".playfield")?.requestFullscreen?.()}><Maximize2 size={14}/> FULLSCREEN</button></div><div className="playfield"><Game key={active} id={active!} onFinish={finish}/></div><div className="hint">ⓘ Keyboard controls are shown in each game where supported. Your score and XP are saved automatically.</div></section>
      :stats?<section className="content"><div className="eyebrow">PLAYER PERFORMANCE</div><h1 className="page-title">YOUR <em>RECORD.</em></h1><p className="sub">Every run counts. Every retry is data.</p><div className="stats-grid"><Stat icon={<Gamepad2/>} label="TOTAL RUNS" value={save.played}/><Stat icon={<Trophy/>} label="VICTORIES" value={save.wins}/><Stat icon={<Crown/>} label="PLAYER LEVEL" value={level}/><Stat icon={<Sparkles/>} label="TOTAL XP" value={save.xp}/></div><div className="records"><div className="record-head"><b>PERSONAL BESTS</b><span>ALL-TIME RECORDS · 31 GAMES</span></div>{games.map(g=><div className="record" key={g.id}><span className={`record-icon ${g.color}`}><g.icon/></span><b>{g.title}</b><div className="bar"><i style={{width:`${Math.min(100,(save.best[g.id]||0)/Math.max(1,...Object.values(save.best))*100)}%`}}/></div><strong>{save.best[g.id]||0}</strong></div>)}</div><h2 className="section-title">ACHIEVEMENTS <small>/ {achievements.filter(a=>a.unlocked).length} OF {achievements.length} UNLOCKED</small></h2><div className="achievement-grid">{achievements.map(a=><div className={a.unlocked?"achievement unlocked":"achievement"} key={a.name}><span>{a.icon}</span><div><b>{a.name}</b><small>{a.description}</small></div><strong>{a.unlocked?"UNLOCKED":"LOCKED"}</strong></div>)}</div><p className="privacy"><Shield/> Progress is stored in this browser. Export a backup in Settings before clearing site data.</p></section>
      :settings?<section className="content settings-page"><div className="eyebrow">PLAYER CONFIGURATION</div><h1 className="page-title">YOUR <em>SETTINGS.</em></h1><p className="sub">Profile, appearance and save management.</p><div className="settings-panel"><label>PLAYER NAME<input maxLength={20} value={save.profileName} onChange={e=>setSave(s=>({...s,profileName:e.target.value.slice(0,20)}))}/></label><div className="setting-row"><div><b>APPEARANCE</b><small>Choose the arcade color scheme.</small></div><div className="setting-actions"><button className={save.theme==="neon"?"secondary selected":"secondary"} onClick={()=>setSave(s=>({...s,theme:"neon"}))}>NEON DARK</button><button className={save.theme==="light"?"secondary selected":"secondary"} onClick={()=>setSave(s=>({...s,theme:"light"}))}>LIGHT</button></div></div><div className="setting-row"><div><b>SOUND</b><small>Sound preference for supported game effects.</small></div><button className="secondary" onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?"SOUND ON":"SOUND OFF"}</button></div><div className="setting-row shop-row"><div><b>COSMETIC SHOP</b><small>Unlock an accent palette with arcade coins and equip it instantly.</small></div><div className="skin-shop">{skins.map(item=>{const unlocked=save.unlockedSkins.includes(item.id);return <button key={item.id} className={save.skin===item.id?"skin-option equipped":"skin-option"} disabled={!unlocked&&save.coins<item.price} onClick={()=>setSave(s=>s.unlockedSkins.includes(item.id)?{...s,skin:item.id}:{...s,coins:s.coins-item.price,unlockedSkins:[...s.unlockedSkins,item.id],skin:item.id})}><i className={`skin-swatch ${item.id}`}/><b>{item.name}</b><small>{save.skin===item.id?"EQUIPPED":unlocked?"UNLOCKED":`${item.price} COINS`}</small></button>;})}</div></div><div className="setting-row"><div><b>LOCAL BACKUP</b><small>Export or restore your profile, XP, records and favorites.</small></div><div className="setting-actions"><button className="secondary" onClick={exportSave}><Download size={14}/> EXPORT</button><label className="secondary file-label"><Upload size={14}/> IMPORT<input type="file" accept="application/json,.json" onChange={e=>{const file=e.target.files?.[0];if(file)importSave(file);e.currentTarget.value="";}}/></label></div></div><div className="setting-row danger-row"><div><b>RESET PROFILE</b><small>Permanently clear local progress on this device.</small></div><button className="secondary danger-button" onClick={resetSave}><RotateCcw size={14}/> RESET ALL DATA</button></div></div><p className="privacy"><Shield/> No account or backend is connected. Cloud sync and online leaderboards require a server and authentication layer.</p></section>
      :<Dashboard save={save} level={level} launch={launch} favorite={id=>setSave(s=>({...s,favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]}))}/>}
      <footer className="footer"><span>NEON ARCADE <b>•</b> BUILT FOR THE NEXT HIGH SCORE</span><span>LOCAL SAVE ENABLED <i/></span></footer>
    </main>
  </div>;
}
