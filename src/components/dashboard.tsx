import { useState } from "react";
import { Activity, Award, Bolt, Brain, Crown, Gamepad2, Heart, Shield, Target, Trophy, Zap, Play, ArrowRight, Grid3X3, MousePointerClick, Type, Star } from "lucide-react";
import type { ReactNode } from "react";
import type { GameId } from "../types/game";
import type { Save } from "../types/player";

export const games = [
  { id: "snake" as const, title: "NEON SNAKE", genre: "ARCADE", description: "One more apple. One more point. Don't hit yourself.", icon: Activity, color: "mint", level: "CLASSIC" },
  { id: "2048" as const, title: "2048", genre: "PUZZLE", description: "Merge tiles, plan ahead, reach the legendary tile.", icon: Brain, color: "violet", level: "STRATEGY" },
  { id: "memory" as const, title: "MEMORY MATRIX", genre: "BRAIN", description: "Train your focus. Match every pair with fewer moves.", icon: Bolt, color: "pink", level: "FOCUS" },
  { id: "xo" as const, title: "XO ARENA", genre: "DUEL", description: "A tiny board. A surprisingly stubborn opponent.", icon: Target, color: "blue", level: "TACTICAL" },
  { id: "reflex" as const, title: "REFLEX RUSH", genre: "REACTION", description: "Wait for green. React faster than your excuses.", icon: Zap, color: "orange", level: "SPEED" },
  { id: "lights-out" as const, title: "LIGHTS OUT", genre: "LOGIC", description: "Switch off every light with the fewest moves.", icon: Grid3X3, color: "blue", level: "PUZZLE" },
  { id: "tap-blitz" as const, title: "TAP BLITZ", genre: "ARCADE", description: "Hit the glowing targets before the clock runs out.", icon: MousePointerClick, color: "orange", level: "SPEED" },
  { id: "word-scramble" as const, title: "WORD SCRAMBLE", genre: "WORD", description: "Rebuild five hidden words from mixed-up letters.", icon: Type, color: "violet", level: "BRAIN" },
];

export function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="stat"><span>{icon}</span><div><small>{label}</small><b>{value.toLocaleString()}</b></div></div>;
}

export function Dashboard({ save, level, launch, favorite }: {
  save: Save;
  level: number;
  launch: (id: GameId) => void;
  favorite: (id: GameId) => void;
}) {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const visibleGames = favoritesOnly ? games.filter((game) => save.favorites.includes(game.id)) : games;

  return (
    <section className="content">
      <div className="welcome">
        <div><div className="eyebrow"><i /> WELCOME BACK, PLAYER</div><h1>Ready to <em>play?</em></h1><p>Your next personal best is one game away.</p></div>
        <span className="ready">◷ YOUR ARCADE IS READY</span>
      </div>
      <div className="hero">
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="featured"><i /> FEATURED GAME</div>
          <h2>ENTER THE<br /><em>NEON GRID.</em></h2>
          <p>Fast moves. Clean lines. A high score waiting to happen.</p>
          <button className="primary" onClick={() => launch("snake")}><Play size={15} fill="currentColor" /> PLAY SNAKE <ArrowRight size={15} /></button>
        </div>
        <div className="hero-art"><div className="orbit one" /><div className="orbit two" /><div className="snake-art"><i /><i /><i /><i /><i /><i /><b /></div><div className="hero-score">001<small>HIGH SCORE</small></div></div>
        <span className="hero-count">01 <small>/ 08</small></span>
      </div>
      <div className="stats-strip">
        <Stat icon={<Gamepad2 />} label="GAMES PLAYED" value={save.played} />
        <Stat icon={<Trophy />} label="VICTORIES" value={save.wins} />
        <Stat icon={<Crown />} label="PLAYER LEVEL" value={level} />
        <Stat icon={<Award />} label="BEST SCORE" value={Math.max(0, ...Object.values(save.best))} />
      </div>
      <div className="section-heading">
        <div><div className="eyebrow">PICK YOUR CHALLENGE</div><h2>THE ARCADE <small>/ {String(games.length).padStart(2, "0")}</small></h2></div>
        <button
          className={favoritesOnly ? "favorites-filter active" : "favorites-filter"}
          onClick={() => setFavoritesOnly((value) => !value)}
          aria-pressed={favoritesOnly}
        >
          <Star size={13} fill={favoritesOnly ? "currentColor" : "none"} />
          {favoritesOnly ? "SHOW ALL GAMES" : `FAVORITES · ${save.favorites.length}`}
        </button>
      </div>
      {visibleGames.length ? (
        <div className="game-grid">
          {visibleGames.map((game) => {
            const index = games.findIndex((item) => item.id === game.id);
            return (
              <article className={`game-card ${game.color}`} key={game.id}>
                <div className="card-top"><small>0{index + 1} / GAME</small><button onClick={() => favorite(game.id)} aria-label={save.favorites.includes(game.id) ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`} aria-pressed={save.favorites.includes(game.id)}><Heart size={16} fill={save.favorites.includes(game.id) ? "currentColor" : "none"} /></button></div>
                <div className="game-art"><div className="glow" /><game.icon /></div>
                <div className="card-info"><div className="meta"><span>{game.genre}</span><small>{game.level}</small></div><h3>{game.title}</h3><p>{game.description}</p>
                  <div className="card-bottom"><small>BEST <b>{save.best[game.id] || 0}</b></small><button onClick={() => launch(game.id)}>PLAY <ArrowRight size={14} /></button></div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-favorites"><Star size={20} /><b>NO FAVORITES YET</b><span>Mark a game with the heart icon and it will appear here.</span></div>
      )}
      <div className="callout"><Shield /><div><b>YOUR PROGRESS STAYS YOURS.</b><p>Scores, XP and favorites are saved locally on this device. No account. No nonsense.</p></div><span>✓ LOCAL-FIRST</span></div>
    </section>
  );
}
