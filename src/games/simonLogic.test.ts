import { describe, expect, it } from "vitest";
import { appendSimonInput } from "./simonLogic";

describe("Simon Says input", () => {
  it("accepts a correct prefix and completes the sequence", () => {
    expect(appendSimonInput([2, 0], [], 2)).toEqual({
      kind: "continue",
      input: [2],
    });
    expect(appendSimonInput([2, 0], [2], 0)).toEqual({
      kind: "complete",
      input: [2, 0],
    });
  });

  it("ignores presses after the sequence has already been completed", () => {
    expect(appendSimonInput([2, 0], [2, 0], 1)).toEqual({
      kind: "ignored",
    });
  });

  it("rejects a wrong value without extending the input", () => {
    expect(appendSimonInput([2, 0], [2], 3)).toEqual({
      kind: "mistake",
    });
  });

  it("ignores input while no sequence exists", () => {
    expect(appendSimonInput([], [], 1)).toEqual({ kind: "ignored" });
  });
});
