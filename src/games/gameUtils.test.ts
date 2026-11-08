import { describe, expect, it } from "vitest";
import { isBeforeDeadline, meetsReactionTarget } from "./gameUtils";

describe("game timing rules", () => {
  it("does not accept an action at or after its deadline", () => {
    expect(isBeforeDeadline(19_999, 20_000)).toBe(true);
    expect(isBeforeDeadline(20_000, 20_000)).toBe(false);
    expect(isBeforeDeadline(20_001, 20_000)).toBe(false);
    expect(isBeforeDeadline(Number.NaN, 20_000)).toBe(false);
  });

  it("uses the advertised strict reaction target", () => {
    expect(meetsReactionTarget(299)).toBe(true);
    expect(meetsReactionTarget(300)).toBe(false);
    expect(meetsReactionTarget(349)).toBe(false);
    expect(meetsReactionTarget(-1)).toBe(false);
    expect(meetsReactionTarget(Number.NaN)).toBe(false);
  });
});
