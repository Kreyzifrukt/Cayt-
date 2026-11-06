import { useEffect, useRef, useState } from "react";
import { BarChart3, ChevronRight, Crown, Gamepad2, Home, Menu, Sparkles, Shield, Trophy, Volume2, VolumeX, Settings, Download, Upload, Maximize2, RotateCcw } from "lucide-react";
import { Game } from "./games";
import type { GameId } from "./types/game";
import { Dashboard, games } from "./components/dashboard";
import type { Save } from "./types/player";
import { DEFAULT_SAVE } from "./types/player";
import { normalizeSave } from "./services/storage/playerStorage";
import { usePlayerSave } from "./hooks/usePlayerSave";
import { GameGuide } from "./components/game-guide";
import { PlayerStats } from "./components/player-stats";
import { gameCopy } from "./games/gameGuides";
import { t } from "./i18n";
import { playArcadeSound } from "./services/audio/audioManager";

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
  const runStartedAt=useRef<number|null>(null);
  const awaitingRestart=useRef(false);
  const level=Math.floor(save.xp/250)+1;
  const tr=(key: Parameters<typeof t>[1])=>t(save.language,key);
  const selectedCopy=active?gameCopy(active,save.language):null;
  useEffect(()=>{if(save.dailyDate!==todayKey())setSave(s=>({...s,dailyDate:todayKey(),dailyRuns:0,dailyClaimed:false}));},[save.dailyDate,setSave]);
  const finish=(id:GameId,score:number,won:boolean)=>{
    const finishedAt=Date.now();
    const startedAt=runStartedAt.current;
    if(startedAt===null)return;
    runStartedAt.current=null;
    awaitingRestart.current=true;
    const session={id,playedAt:new Date(finishedAt).toISOString(),durationSeconds:Math.max(0,Math.round((finishedAt-startedAt)/1000)),score:Math.max(0,score),won};
    const currentDailyDate=save.dailyDate===todayKey();
    const nextDailyRuns=(currentDailyDate?save.dailyRuns:0)+1;
    const dailyReward=nextDailyRuns===3&&!(currentDailyDate&&save.dailyClaimed);
    const baseXp=Math.max(5,Math.round(score/5)+10);
    const gainedXp=baseXp+(dailyReward?50:0);
    const levelUp=Math.floor((save.xp+gainedXp)/250)>Math.floor(save.xp/250);
    if(save.sound)playArcadeSound(dailyReward||levelUp?"reward":won?"win":"lose",save.effectsVolume);
    setSave(s=>{
      const fresh=s.dailyDate===todayKey()?s:{...s,dailyDate:todayKey(),dailyRuns:0,dailyClaimed:false};
      const runs=fresh.dailyRuns+1;
      const reward=runs===3&&!fresh.dailyClaimed;
      return {...fresh,xp:fresh.xp+Math.max(5,Math.round(score/5)+10)+(reward?50:0),
        coins:fresh.coins+Math.max(1,Math.floor(score/100))+(reward?25:0),
        played:fresh.played+1,wins:fresh.wins+(won?1:0),dailyRuns:runs,dailyClaimed:fresh.dailyClaimed||reward,
        best:{...fresh.best,[id]:Math.max(fresh.best[id]||0,score)},
        gameStats:{...fresh.gameStats,[id]:{
          played:(fresh.gameStats[id]?.played||0)+1,
          wins:(fresh.gameStats[id]?.wins||0)+(won?1:0),
          totalDurationSeconds:(fresh.gameStats[id]?.totalDurationSeconds||0)+session.durationSeconds,
          bestScore:Math.max(fresh.gameStats[id]?.bestScore||0,score),
        }},
        history:[session,...fresh.history].slice(0,500)};
    });
  };
  useEffect(()=>{
    if(!active)return;
    const beginAgain=(event:Event)=>{
      if(!awaitingRestart.current)return;
      const target=event.target as HTMLElement|null;
      if(event.type==="keydown"||target?.closest(".playfield")){
        runStartedAt.current=Date.now();
        awaitingRestart.current=false;
      }
    };
    document.addEventListener("pointerdown",beginAgain,true);
    window.addEventListener("keydown",beginAgain,true);
    return()=>{
      document.removeEventListener("pointerdown",beginAgain,true);
      window.removeEventListener("keydown",beginAgain,true);
    };
  },[active]);
  const launch=(id:GameId)=>{awaitingRestart.current=false;runStartedAt.current=Date.now();setActive(id);setStats(false);setSettings(false);setMenu(false);};
  const selected=games.find(g=>g.id===active);
  const exportSave=()=>{
    const blob=new Blob([JSON.stringify(save,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");
    link.href=url;link.download="neon-arcade-save.json";link.click();URL.revokeObjectURL(url);
  };
  const importSave=(file:File)=>{
    file.text().then(raw=>{const parsed:unknown=JSON.parse(raw);setSave(normalizeSave(parsed));})
      .catch(()=>window.alert(tr("invalidBackup")));
  };
  const resetSave=()=>{
    if(window.confirm(tr("resetConfirm")))setSave({...DEFAULT_SAVE,dailyDate:todayKey()});
  };
  const skins=[{id:"mint",name:"NEON MINT",price:0},{id:"violet",name:"VIOLET PULSE",price:100},{id:"ember",name:"EMBER CORE",price:125},{id:"ice",name:"ARCTIC GLOW",price:150}] as const;

  return <div className={["shell",save.theme==="light"?"light-theme":"",save.skin!=="mint"?`skin-${save.skin}`:""].filter(Boolean).join(" ")} onClickCapture={event=>{const target=event.target as HTMLElement;if(save.sound&&!target.closest("input,textarea,select"))playArcadeSound("click",save.effectsVolume*0.35);}}>
    <aside className={`sidebar ${menu?"open":""}`}>
      <button className="brand" onClick={()=>{setActive(null);setStats(false);setSettings(false);}}><span className="brand-icon"><Gamepad2/></span><span>NEON<span className="brand-light">ARCADE</span><small>PLAY BEYOND LIMITS</small></span></button>
      <div className="side-label">{tr("yourSpace")}</div>
      <button className={!active&&!stats&&!settings?"nav active":"nav"} onClick={()=>{setActive(null);setStats(false);setSettings(false);}}><Home/> {tr("dashboard")}</button>
      <button className={stats?"nav active":"nav"} onClick={()=>{setStats(true);setActive(null);setSettings(false);}}><BarChart3/> {tr("statistics")}</button>
      <button className={settings?"nav active":"nav"} onClick={()=>{setSettings(true);setStats(false);setActive(null);}}><Settings/> {tr("settings")}</button>
      <div className="side-label game-label">{tr("arcade")} <span>{String(games.length).padStart(2,"0")}</span></div>
      <div className="sidebar-games">{games.map(g=>{const copy=gameCopy(g.id,save.language);return <button key={g.id} className={active===g.id?"nav active":"nav"} onClick={()=>launch(g.id)}><g.icon/> {copy.title}<ChevronRight className="nav-arrow"/></button>;})}</div>
      <div className="side-bottom"><div className="level-card"><div className="level-caption">{tr("playerLevel")} <Crown size={14}/></div><strong>LVL {String(level).padStart(2,"0")}</strong><span>{save.xp} XP</span><div className="progress"><i style={{width:`${save.xp%250/2.5}%`}}/></div><small>{250-save.xp%250} {tr("xpToNext")}</small></div><div className="profile"><div className="avatar">{save.profileName.slice(0,2).toUpperCase()}</div><div><b>{save.profileName.toUpperCase()}</b><small>{save.coins} COINS</small></div><button className="sound" aria-label="Toggle sound" onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?<Volume2/>:<VolumeX/>}</button></div></div>
    </aside>
    {menu&&<button className="scrim" onClick={()=>setMenu(false)} aria-label="Close menu"/>}
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={()=>setMenu(true)}><span>☰</span></button><div className="crumb">ARCADE <span>/</span> {selectedCopy?.title||(stats?tr("statistics"):settings?tr("settings"):tr("dashboard"))}</div><div className="top-right"><span className="online"><i/> {tr("online")}</span><span key={save.xp} className="xp xp-earned"><Sparkles size={15}/> {save.xp.toLocaleString()} XP · {save.coins} {tr("coins")}</span></div></header>
      {selected?<section className="game-page"><button className="back" onClick={()=>setActive(null)}>{tr("back")}</button><div className="game-title"><div><div className="eyebrow">{selectedCopy?.genre} / {selectedCopy?.level}</div><h1>{selectedCopy?.title}</h1><p>{selectedCopy?.description}</p></div><div className="best"><Trophy/><span>{tr("personalBest")}</span><b>{(save.best[active!]||0).toLocaleString()}</b></div></div><div className="game-toolbar-actions"><button className="secondary" onClick={()=>document.querySelector(".playfield")?.requestFullscreen?.()}><Maximize2 size={14}/> {tr("fullscreen")}</button></div><GameGuide id={active!} language={save.language}/><div className="playfield"><Game key={active} id={active!} onFinish={finish}/></div><div className="hint">ⓘ {tr("keyboardHint")}</div></section>
      :stats?<PlayerStats save={save} level={level}/>:settings?<section className="content settings-page"><div className="eyebrow">{tr("profileConfiguration")}</div><h1 className="page-title">{tr("settingsTitle")}</h1><p className="sub">{tr("settingsSubtitle")}</p><div className="settings-panel"><label>{tr("playerName")}<input maxLength={20} value={save.profileName} onChange={e=>setSave(s=>({...s,profileName:e.target.value.slice(0,20)}))}/></label><div className="setting-row"><div><b>{tr("appearance")}</b><small>{tr("appearanceHelp")}</small></div><div className="setting-actions"><button className={save.theme==="neon"?"secondary selected":"secondary"} onClick={()=>setSave(s=>({...s,theme:"neon"}))}>{tr("neonDark")}</button><button className={save.theme==="light"?"secondary selected":"secondary"} onClick={()=>setSave(s=>({...s,theme:"light"}))}>{tr("light")}</button></div></div><div className="setting-row"><div><b>{tr("sound")}</b><small>{tr("soundHelp")}</small></div><div className="setting-actions"><button className="secondary" onClick={()=>setSave(s=>({...s,sound:!s.sound}))}>{save.sound?tr("soundOn"):tr("soundOff")}</button><label className="volume-control">{tr("effectsVolume")}<input type="range" min="0" max="1" step="0.05" value={save.effectsVolume} disabled={!save.sound} onChange={e=>setSave(s=>({...s,effectsVolume:Number(e.target.value)}))}/></label></div></div><div className="setting-row"><div><b>{tr("language")}</b><small>{tr("languageHelp")}</small></div><div className="setting-actions"><button className={save.language==="uk"?"secondary selected":"secondary"} onClick={()=>setSave(s=>({...s,language:"uk"}))}>УКРАЇНСЬКА</button><button className={save.language==="en"?"secondary selected":"secondary"} onClick={()=>setSave(s=>({...s,language:"en"}))}>ENGLISH</button></div></div><div className="setting-row shop-row"><div><b>{tr("cosmeticShop")}</b><small>{tr("shopHelp")}</small></div><div className="skin-shop">{skins.map(item=>{const unlocked=save.unlockedSkins.includes(item.id);return <button key={item.id} className={save.skin===item.id?"skin-option equipped":"skin-option"} disabled={!unlocked&&save.coins<item.price} onClick={()=>setSave(s=>s.unlockedSkins.includes(item.id)?{...s,skin:item.id}:{...s,coins:s.coins-item.price,unlockedSkins:[...s.unlockedSkins,item.id],skin:item.id})}><i className={`skin-swatch ${item.id}`}/><b>{item.name}</b><small>{save.skin===item.id?tr("equipped"):unlocked?tr("unlocked"):`${item.price} COINS`}</small></button>;})}</div></div><div className="setting-row"><div><b>{tr("localBackup")}</b><small>{tr("backupHelp")}</small></div><div className="setting-actions"><button className="secondary" onClick={exportSave}><Download size={14}/> {tr("export")}</button><label className="secondary file-label"><Upload size={14}/> {tr("import")}<input type="file" accept="application/json,.json" onChange={e=>{const file=e.target.files?.[0];if(file)importSave(file);e.currentTarget.value="";}}/></label></div></div><div className="setting-row danger-row"><div><b>{tr("resetProfile")}</b><small>{tr("resetHelp")}</small></div><button className="secondary danger-button" onClick={resetSave}><RotateCcw size={14}/> {tr("resetAll")}</button></div></div><p className="privacy"><Shield/> {tr("noBackend")}</p></section>
      :<Dashboard save={save} level={level} launch={launch} favorite={id=>setSave(s=>({...s,favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]}))}/>}
      <footer className="footer"><span>NEON ARCADE <b>•</b> {save.language==="uk"?"СТВОРЕНО ДЛЯ НОВИХ РЕКОРДІВ":"BUILT FOR THE NEXT HIGH SCORE"}</span><span>{save.language==="uk"?"ЛОКАЛЬНЕ ЗБЕРЕЖЕННЯ УВІМКНЕНО":"LOCAL SAVE ENABLED"} <i/></span></footer>
    </main>
  </div>;
}
