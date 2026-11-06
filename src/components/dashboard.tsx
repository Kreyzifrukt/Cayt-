import { useEffect, useMemo, useState } from "react";
import {
  Activity, Award, Bolt, Brain, Crown, Gamepad2, Heart, Shield, Target, Trophy,
  Zap, Play, ArrowRight, Grid3X3, MousePointerClick, Type, Star, Bomb, Blocks,
  CircleDot, BrainCircuit, Ghost, Timer, Calculator, Palette, Keyboard, Hash,
  TrendingUp, Layers, Columns3, Package, Circle, Lock, Spade, Car, Gem, Compass,
} from "lucide-react";
import type { ReactNode } from "react";
import type { GameId } from "../types/game";
import type { Save } from "../types/player";
import { gameCopy } from "../games/gameGuides";
import { t } from "../i18n";

export const games = [
  { id: "snake" as const, title: "NEON SNAKE", genre: "ARCADE", description: "Collect energy, grow longer and avoid your own trail.", icon: Activity, color: "mint", level: "CLASSIC" },
  { id: "2048" as const, title: "2048", genre: "PUZZLE", description: "Merge tiles, plan ahead and reach the legendary tile.", icon: Brain, color: "violet", level: "STRATEGY" },
  { id: "memory" as const, title: "MEMORY MATRIX", genre: "BRAIN", description: "Match every pair with as few moves as possible.", icon: Bolt, color: "pink", level: "FOCUS" },
  { id: "xo" as const, title: "XO ARENA", genre: "DUEL", description: "Outsmart a tactical computer opponent.", icon: Target, color: "blue", level: "TACTICAL" },
  { id: "reflex" as const, title: "REFLEX RUSH", genre: "REACTION", description: "Wait for green and test your reaction time.", icon: Zap, color: "orange", level: "SPEED" },
  { id: "lights-out" as const, title: "LIGHTS OUT", genre: "LOGIC", description: "Switch off every light with the fewest moves.", icon: Grid3X3, color: "blue", level: "PUZZLE" },
  { id: "tap-blitz" as const, title: "TAP BLITZ", genre: "ARCADE", description: "Hit glowing targets before the clock runs out.", icon: MousePointerClick, color: "orange", level: "SPEED" },
  { id: "word-scramble" as const, title: "WORD SCRAMBLE", genre: "WORD", description: "Rebuild hidden words from mixed-up letters.", icon: Type, color: "violet", level: "BRAIN" },
  { id: "minesweeper" as const, title: "MINESWEEPER", genre: "PUZZLE", description: "Clear an 8×8 field without detonating a mine.", icon: Bomb, color: "orange", level: "LOGIC" },
  { id: "tetris" as const, title: "TETRIS", genre: "ARCADE", description: "Fit falling shapes, clear rows and survive the stack.", icon: Blocks, color: "blue", level: "CLASSIC" },
  { id: "breakout" as const, title: "BREAKOUT", genre: "ARCADE", description: "Bounce the ball, break the wall and save the rally.", icon: CircleDot, color: "pink", level: "SKILL" },
  { id: "pong" as const, title: "NEON PONG", genre: "DUEL", description: "A minimalist paddle duel against the machine.", icon: Gamepad2, color: "mint", level: "CLASSIC" },
  { id: "simon" as const, title: "SIMON SAYS", genre: "BRAIN", description: "Remember an ever-growing sequence of lights.", icon: BrainCircuit, color: "violet", level: "MEMORY" },
  { id: "hangman" as const, title: "HANGMAN", genre: "WORD", description: "Reveal the hidden word before six wrong guesses.", icon: Type, color: "pink", level: "VOCABULARY" },
  { id: "connect-four" as const, title: "CONNECT FOUR", genre: "DUEL", description: "Connect four discs before the CPU does.", icon: Columns3, color: "orange", level: "TACTICAL" },
  { id: "whack-a-mole" as const, title: "WHACK-A-MOLE", genre: "REACTION", description: "Track the target and hit it before it moves.", icon: Ghost, color: "mint", level: "SPEED" },
  { id: "math-sprint" as const, title: "MATH SPRINT", genre: "BRAIN", description: "Solve as many quick-fire sums as you can.", icon: Calculator, color: "blue", level: "MENTAL" },
  { id: "color-clash" as const, title: "COLOR CLASH", genre: "REACTION", description: "Name the ink color, not the word on screen.", icon: Palette, color: "pink", level: "FOCUS" },
  { id: "pattern-recall" as const, title: "PATTERN RECALL", genre: "BRAIN", description: "Memorize an expanding pattern and repeat it.", icon: Grid3X3, color: "violet", level: "MEMORY" },
  { id: "higher-lower" as const, title: "HIGHER OR LOWER", genre: "CARD", description: "Predict the next card and build a winning streak.", icon: TrendingUp, color: "orange", level: "CHANCE" },
  { id: "typing-rush" as const, title: "TYPING RUSH", genre: "WORD", description: "Race the clock and measure your typing speed.", icon: Keyboard, color: "blue", level: "SPEED" },
  { id: "number-hunt" as const, title: "NUMBER HUNT", genre: "PUZZLE", description: "Find the numbers from one to twenty-five in order.", icon: Hash, color: "mint", level: "FOCUS" },
  { id: "mini-sudoku" as const, title: "MINI SUDOKU", genre: "PUZZLE", description: "Complete a compact 4×4 logic grid.", icon: Layers, color: "violet", level: "LOGIC" },
  { id: "fifteen-puzzle" as const, title: "15-PUZZLE", genre: "PUZZLE", description: "Slide numbered tiles into order with one empty space.", icon: Grid3X3, color: "blue", level: "CLASSIC" },
  { id: "sokoban" as const, title: "SOKOBAN", genre: "PUZZLE", description: "Push every crate onto its storage point. Plan each move.", icon: Package, color: "orange", level: "STRATEGY" },
  { id: "reversi" as const, title: "REVERSI", genre: "DUEL", description: "Capture the board by trapping your opponent in lines.", icon: Circle, color: "mint", level: "TACTICAL" },
  { id: "mastermind" as const, title: "MASTERMIND", genre: "BRAIN", description: "Crack a hidden color code using exact and misplaced clues.", icon: Lock, color: "violet", level: "LOGIC" },
  { id: "blackjack" as const, title: "BLACKJACK", genre: "CARD", description: "Beat the dealer by getting closer to 21 without busting.", icon: Spade, color: "pink", level: "CLASSIC" },
  { id: "frogger" as const, title: "FROGGER", genre: "ARCADE", description: "Cross moving traffic lanes and reach safety three times.", icon: Car, color: "mint", level: "REACTION" },
  { id: "match-three" as const, title: "GEM MATCH", genre: "PUZZLE", description: "Swap neighboring gems, chain matches and hit the score target.", icon: Gem, color: "pink", level: "COMBO" },
  { id: "maze-runner" as const, title: "MAZE RUNNER", genre: "PUZZLE", description: "Find the key and navigate a compact maze to the exit.", icon: Compass, color: "violet", level: "CLASSIC" },
];

export function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="stat"><span>{icon}</span><div><small>{label}</small><b>{value.toLocaleString()}</b></div></div>;
}
export function Dashboard({ save, level, launch, favorite }: {
  save: Save; level: number; launch: (id: GameId) => void; favorite: (id: GameId) => void;
}) {
  const tr=(key: Parameters<typeof t>[1])=>t(save.language,key);
  const localizedGames=games.map(game=>({...game,...gameCopy(game.id,save.language)}));
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("ALL");
  useEffect(() => setGenre("ALL"), [save.language]);
  const genres = useMemo(() => ["ALL", ...Array.from(new Set(localizedGames.map(g => g.genre))).sort()], [save.language]);
  const visibleGames = localizedGames.filter(game =>
    (!favoritesOnly || save.favorites.includes(game.id)) &&
    (genre === "ALL" || game.genre === genre) &&
    (game.title.toLowerCase().includes(query.toLowerCase()) || game.description.toLowerCase().includes(query.toLowerCase()))
  );
  return <section className="content">
    <div className="welcome"><div><div className="eyebrow"><i/> {tr("welcome")}, {save.profileName.toUpperCase()}</div><h1>{save.language==="uk"?"Готові до":"Ready to"} <em>{save.language==="uk"?"гри?":"play?"}</em></h1><p>{tr("nextBest")}</p></div><span className="ready">{tr("ready")}</span></div>
    <div className="hero"><div className="hero-grid"/><div className="hero-copy"><div className="featured"><i/> {tr("featured")}</div><h2>{tr("enterGrid")}<br/><em>{tr("neonGrid")}</em></h2><p>{tr("heroText")}</p><button className="primary" onClick={()=>launch("snake")}><Play size={15} fill="currentColor"/> {tr("playSnake")} <ArrowRight size={15}/></button></div><div className="hero-art"><div className="orbit one"/><div className="orbit two"/><div className="snake-art"><i/><i/><i/><i/><i/><i/><b/></div><div className="hero-score">001<small>HIGH SCORE</small></div></div><span className="hero-count">01 <small>/ 31</small></span></div>
    <div className="stats-strip"><Stat icon={<Gamepad2/>} label={tr("gamesPlayed")} value={save.played}/><Stat icon={<Trophy/>} label={tr("victories")} value={save.wins}/><Stat icon={<Crown/>} label={tr("playerLevel")} value={level}/><Stat icon={<Award/>} label={tr("bestScore")} value={Math.max(0,...Object.values(save.best))}/></div>
    <div className="daily-card"><div><div className="eyebrow">{tr("dailyQuest")}</div><b>{tr("warmup")}</b><p>{tr("dailyDescription")}</p></div><div className="daily-progress"><strong>{Math.min(3,save.dailyRuns)} / 3</strong><div className="progress"><i style={{width:`${Math.min(100,save.dailyRuns/3*100)}%`}}/></div><small>{save.dailyClaimed?tr("rewardClaimed"):tr("dailyReward")}</small></div></div>
    <div className="section-heading"><div><div className="eyebrow">{tr("pickChallenge")}</div><h2>{tr("arcade")} <small>/ {String(games.length).padStart(2,"0")}</small></h2></div><button className={favoritesOnly?"favorites-filter active":"favorites-filter"} onClick={()=>setFavoritesOnly(v=>!v)} aria-pressed={favoritesOnly}><Star size={13} fill={favoritesOnly?"currentColor":"none"}/>{favoritesOnly?tr("showAll"):`${tr("favorites")} · ${save.favorites.length}`}</button></div>
    <div className="game-filters"><input aria-label={tr("searchGames")} placeholder={tr("searchGames")} value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label={tr("allGenres")} value={genre} onChange={e=>setGenre(e.target.value)}>{genres.map(g=><option key={g} value={g}>{g==="ALL"?tr("allGenres"):g}</option>)}</select></div>
    {visibleGames.length?<div className="game-grid">{visibleGames.map(game=>{const index=games.findIndex(g=>g.id===game.id);return <article className={`game-card ${game.color}`} key={game.id}><div className="card-top"><small>{String(index+1).padStart(2,"0")} / {save.language==="uk"?"ГРА":"GAME"}</small><button onClick={()=>favorite(game.id)} aria-label={save.language==="uk"?(save.favorites.includes(game.id)?`Прибрати ${game.title} з обраного`:`Додати ${game.title} до обраного`):(save.favorites.includes(game.id)?`Remove ${game.title} from favorites`:`Add ${game.title} to favorites`)} aria-pressed={save.favorites.includes(game.id)}><Heart size={16} fill={save.favorites.includes(game.id)?"currentColor":"none"}/></button></div><div className="game-art"><div className="glow"/><game.icon/></div><div className="card-info"><div className="meta"><span>{game.genre}</span><small>{game.level}</small></div><h3>{game.title}</h3><p>{game.description}</p><div className="card-bottom"><small>{tr("best")} <b>{save.best[game.id]||0}</b></small><button onClick={()=>launch(game.id)}>{tr("play")} <ArrowRight size={14}/></button></div></div></article>;})}</div>:<div className="empty-favorites"><Star size={20}/><b>{tr("noGames")}</b><span>{tr("trySearch")}</span></div>}
    <div className="callout"><Shield/><div><b>{tr("progressYours")}</b><p>{tr("progressHelp")}</p></div><span>✓ {tr("localFirst")}</span></div>
  </section>;
}
