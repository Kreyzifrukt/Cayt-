import { Award, CalendarDays, Clock3, Crown, Gamepad2, Medal, Shield, Sparkles, Trophy, TrendingUp } from "lucide-react";
import type { Save } from "../types/player";
import { games, Stat } from "./dashboard";
import { gameCopy } from "../games/gameGuides";
import { t } from "../i18n";

interface Props { save: Save; level: number }

function formatDuration(seconds: number, language: Save["language"]) {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const unitMin = t(language, "minutes");
  const unitSec = t(language, "seconds");
  return minutes ? minutes + " " + unitMin + " " + String(rest).padStart(2, "0") + " " + unitSec : rest + " " + unitSec;
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function isWithinWeek(value: string, now: Date) {
  const date = new Date(value);
  return date >= startOfWeek(now) && date <= now;
}

function isWithinMonth(value: string, now: Date) {
  const date = new Date(value);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date <= now;
}

function bestSession(sessions: Save["history"]) {
  return sessions.reduce<Save["history"][number] | null>((best, session) =>
    !best || session.score > best.score ? session : best, null);
}

export function PlayerStats({ save, level }: Props) {
  const language = save.language;
  const tr = (key: Parameters<typeof t>[1]) => t(language, key);
  const now = new Date();
  const tracked = Object.values(save.gameStats).reduce((total, value) => total + (value?.played || 0), 0);
  const trackedSeconds = Object.values(save.gameStats).reduce((total, value) => total + (value?.totalDurationSeconds || 0), 0);
  const averageSeconds = tracked ? Math.round(trackedSeconds / tracked) : 0;
  const winRate = save.played ? Math.round(save.wins / save.played * 100) : 0;
  const weekly = bestSession(save.history.filter(session => isWithinWeek(session.playedAt, now)));
  const monthly = bestSession(save.history.filter(session => isWithinMonth(session.playedAt, now)));
  const popular = games
    .map(game => ({ ...game, count: save.gameStats[game.id]?.played || 0 }))
    .sort((a, b) => b.count - a.count)[0];
  const maximumPlayed = Math.max(1, ...games.map(game => save.gameStats[game.id]?.played || 0));
  const gameRows = [...games].sort((a, b) =>
    (save.gameStats[b.id]?.played || 0) - (save.gameStats[a.id]?.played || 0) ||
    a.title.localeCompare(b.title)
  );
  const achievements = [
    { name: "FIRST STEPS", description: language === "uk" ? "Завершіть першу гру" : "Complete your first game", unlocked: save.played >= 1, icon: <Gamepad2/> },
    { name: "ARCADE REGULAR", description: language === "uk" ? "Завершіть 25 ігор" : "Complete 25 games", unlocked: save.played >= 25, icon: <Trophy/> },
    { name: "WINNER'S CIRCLE", description: language === "uk" ? "Виграйте 10 ігор" : "Win 10 games", unlocked: save.wins >= 10, icon: <Medal/> },
    { name: "LEVEL FIVE", description: language === "uk" ? "Досягніть 5 рівня" : "Reach player level 5", unlocked: level >= 5, icon: <Crown/> },
    { name: "COLLECTOR", description: language === "uk" ? "Додайте 5 ігор до обраного" : "Favorite 5 games", unlocked: save.favorites.length >= 5, icon: <Award/> },
    { name: "FULL HOUSE", description: language === "uk" ? "Встановіть рекорди у 10 іграх" : "Set a record in 10 games", unlocked: Object.values(save.best).filter(score => (score || 0) > 0).length >= 10, icon: <TrendingUp/> },
    { name: "NEON LEGEND", description: language === "uk" ? "Заробіть 5 000 XP" : "Earn 5,000 XP", unlocked: save.xp >= 5000, icon: <Sparkles/> },
  ];
  const dateFormatter = new Intl.DateTimeFormat(language === "uk" ? "uk-UA" : "en-US", { dateStyle: "medium", timeStyle: "short" });

  const periodCard = (label: string, session: Save["history"][number] | null) => (
    <article className="profile-period-card">
      <div className="profile-card-kicker"><CalendarDays size={15}/>{label}</div>
      {session ? <>
        <strong>{session.score.toLocaleString()}</strong>
        <span>{gameCopy(session.id, language).title}</span>
        <small>{dateFormatter.format(new Date(session.playedAt))}</small>
      </> : <p>{tr("noPeriodBest")}</p>}
    </article>
  );

  return <section className="content player-stats-page">
    <div className="eyebrow">{tr("playerPerformance")}</div>
    <h1 className="page-title">{tr("yourRecord")}</h1>
    <p className="sub">{language === "uk" ? "Усі ваші партії, перемоги та особисті рекорди в одному місці." : "Every run, victory and personal best, collected in one place."}</p>

    <section className="profile-hero">
      <div className="profile-avatar-large">{save.profileName.slice(0, 2).toUpperCase()}</div>
      <div className="profile-identity"><span>{tr("profileOverview")}</span><h2>{save.profileName.toUpperCase()}</h2><p><Crown size={14}/> {tr("profileLevel")} {level} <i/> {save.xp.toLocaleString()} XP</p></div>
      <div className="profile-hero-total"><small>{tr("totalRuns")}</small><strong>{save.played.toLocaleString()}</strong></div>
    </section>

    <div className="stats-grid profile-metrics">
      <Stat icon={<Gamepad2/>} label={tr("totalRuns")} value={save.played}/>
      <Stat icon={<Trophy/>} label={tr("victories")} value={save.wins}/>
      <Stat icon={<TrendingUp/>} label={tr("winRate")} value={winRate + "%"}/>
      <Stat icon={<Clock3/>} label={tr("averageTime")} value={formatDuration(averageSeconds, language)}/>
    </div>

    <div className="profile-period-grid">
      {periodCard(tr("weeklyBest"), weekly)}
      {periodCard(tr("monthlyBest"), monthly)}
      <article className="profile-period-card popular-card">
        <div className="profile-card-kicker"><Trophy size={15}/>{tr("mostPlayed")}</div>
        {popular.count ? <><strong>{popular.count}</strong><span>{gameCopy(popular.id, language).title}</span><small>{tr("sessions")}</small></> : <p>{tr("noGameData")}</p>}
      </article>
    </div>

    <div className="profile-section-heading"><div><div className="eyebrow">{tr("sessionsTracked")}: {tracked}</div><h2>{tr("gameBreakdown")}</h2></div></div>
    <div className="profile-game-table">
      <div className="profile-table-head"><span>{tr("game")}</span><span>{tr("sessions")}</span><span>{tr("winRate")}</span><span>{tr("average")}</span></div>
      {gameRows.map(game => {
        const data = save.gameStats[game.id];
        const count = data?.played || 0;
        const rate = count ? Math.round((data?.wins || 0) / count * 100) : 0;
        const average = count ? Math.round((data?.totalDurationSeconds || 0) / count) : 0;
        return <div className="profile-game-row" key={game.id}>
          <div className="profile-game-name"><span className={"record-icon " + game.color}><game.icon/></span><b>{gameCopy(game.id, language).title}</b></div>
          <span className="profile-number">{count}</span>
          <span className="profile-rate">{count ? rate + "%" : "—"}</span>
          <span className="profile-time">{count ? formatDuration(average, language) : "—"}</span>
          <div className="profile-game-progress"><i style={{ width: (count / maximumPlayed * 100) + "%" }}/></div>
          <small>{tr("best")}: {(save.best[game.id] || 0).toLocaleString()}</small>
        </div>;
      })}
    </div>

    <div className="profile-section-heading recent-heading"><div><div className="eyebrow">{tr("recordedHistory")}</div><h2>{tr("recentSessions")}</h2></div></div>
    {save.history.length ? <div className="session-history">
      {save.history.slice(0, 12).map((session, index) => <article className="session-row" key={session.playedAt + "-" + index}>
        <div className={"session-result-dot " + (session.won ? "won" : "lost")}>{session.won ? "✓" : "·"}</div>
        <div className="session-game"><b>{gameCopy(session.id, language).title}</b><small>{dateFormatter.format(new Date(session.playedAt))}</small></div>
        <strong>{session.score.toLocaleString()} <small>{tr("scoreLabel")}</small></strong>
        <span>{formatDuration(session.durationSeconds, language)}</span>
        <em className={session.won ? "session-won" : "session-lost"}>{session.won ? tr("win") : tr("loss")}</em>
      </article>)}
    </div> : <div className="profile-empty"><Gamepad2/><b>{tr("noSessions")}</b></div>}

    <h2 className="section-title">{tr("achievements")} <small>/ {achievements.filter(item => item.unlocked).length} OF {achievements.length} UNLOCKED</small></h2>
    <div className="achievement-grid">{achievements.map(item => <div className={item.unlocked ? "achievement unlocked" : "achievement"} key={item.name}><span>{item.icon}</span><div><b>{item.name}</b><small>{item.description}</small></div><strong>{item.unlocked ? tr("unlockedStatus") : tr("locked")}</strong></div>)}</div>
    <p className="privacy"><Shield/> {tr("privacy")}</p>
  </section>;
}
