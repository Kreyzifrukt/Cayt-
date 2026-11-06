import { describe, expect, it } from "vitest";
import { GAME_IDS } from "../services/storage/playerStorage";
import { GAME_GUIDES, guideText } from "./gameGuides";

describe("game instructions", () => {
  it("provides a complete guide for every registered game", () => {
    expect(Object.keys(GAME_GUIDES).sort()).toEqual([...GAME_IDS].sort());
    for (const id of GAME_IDS) {
      const guide = GAME_GUIDES[id];
      expect(guide.titleUk.length).toBeGreaterThan(0);
      expect(guide.goalUk.length).toBeGreaterThan(0);
      expect(guide.rulesUk.length).toBeGreaterThanOrEqual(2);
      expect(guide.controlsUk.length).toBeGreaterThan(0);
    }
  });

  it("returns localized guide content", () => {
    expect(guideText("snake", "uk").goal).toContain("Збирайте");
    expect(guideText("snake", "en").goal).toContain("Collect");
  });
});
