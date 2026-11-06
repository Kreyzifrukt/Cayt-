import type { GameId } from "../types/game";
import type { Language } from "../types/player";
import { guideText } from "../games/gameGuides";
import { t } from "../i18n";

export function GameGuide({ id, language }: { id: GameId; language: Language }) {
  const guide = guideText(id, language);
  return <section className="game-guide" aria-labelledby="game-guide-title">
    <div className="game-guide-heading"><span className="guide-kicker">{t(language,"howToPlay")}</span><span className="guide-language">{language === "uk" ? "ІНСТРУКЦІЯ УКРАЇНСЬКОЮ" : "QUICK GAME GUIDE"}</span></div>
    <p className="guide-summary">{guide.summary}</p>
    <div className="guide-columns">
      <div className="guide-goal"><h3>{t(language,"gameGoal")}</h3><p>{guide.goal}</p></div>
      <div><h3>{t(language,"rules")}</h3><ul>{guide.rules.map((rule,index)=><li key={index}>{rule}</li>)}</ul></div>
      <div><h3>{t(language,"controls")}</h3><p>{guide.controls}</p></div>
    </div>
  </section>;
}
