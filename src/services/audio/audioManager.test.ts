import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class FakeAudio {
  static instances: FakeAudio[] = [];
  static failuresRemaining = 0;
  static constructionFails = false;

  src: string;
  volume = 1;
  paused = true;
  ended = false;
  loop = false;
  preload = "";
  currentTime = 0;
  error: { code: number } | null = null;
  load = vi.fn(() => {
    this.error = null;
    this.paused = true;
  });
  play = vi.fn(async () => {
    if (FakeAudio.failuresRemaining > 0) {
      FakeAudio.failuresRemaining -= 1;
      throw new Error("Playback blocked");
    }
    this.paused = false;
  });
  pause = vi.fn(() => {
    this.paused = true;
  });

  constructor(src: string) {
    if (FakeAudio.constructionFails) throw new Error("Audio unavailable");
    this.src = src;
    FakeAudio.instances.push(this);
  }
}

describe("arcade audio manager", () => {
  let audio: typeof import("./audioManager");

  beforeEach(async () => {
    vi.resetModules();
    FakeAudio.instances = [];
    FakeAudio.failuresRemaining = 0;
    FakeAudio.constructionFails = false;
    vi.stubGlobal("window", {});
    vi.stubGlobal("Audio", FakeAudio);
    audio = await import("./audioManager");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not crash when the browser cannot construct an audio element", async () => {
    FakeAudio.constructionFails = true;

    expect(() => audio.playArcadeSound("click", 0.5)).not.toThrow();
    await expect(audio.startArcadeMusic()).resolves.toBe(false);
  });

  it("allows rapid instances of the same effect to overlap", () => {
    audio.playArcadeSound("click", 0.5);
    audio.playArcadeSound("click", 0.5);
    audio.playArcadeSound("click", 0.5);

    expect(FakeAudio.instances).toHaveLength(3);
    expect(FakeAudio.instances.every(instance => instance.play.mock.calls.length === 1)).toBe(true);
  });

  it("bounds effect voice pools and reuses the oldest voice when full", () => {
    for (let index = 0; index < 6; index += 1) {
      audio.playArcadeSound("win", 0.7);
    }

    expect(FakeAudio.instances).toHaveLength(4);
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(2);
  });

  it("clamps effect volume and skips silent or invalid values", () => {
    audio.playArcadeSound("click", 2);
    expect(FakeAudio.instances[0].volume).toBe(1);

    audio.playArcadeSound("win", 0);
    audio.playArcadeSound("lose", Number.NaN);
    expect(FakeAudio.instances).toHaveLength(1);
  });

  it("applies a volume configured before the music element is created", async () => {
    audio.setArcadeMusicVolume(0.42);
    expect(await audio.startArcadeMusic()).toBe(true);
    expect(FakeAudio.instances[0].volume).toBe(0.42);
    expect(FakeAudio.instances[0].loop).toBe(true);
  });

  it("can retry music after a rejected autoplay attempt without losing its volume", async () => {
    FakeAudio.failuresRemaining = 1;

    expect(await audio.startArcadeMusic(0.36)).toBe(false);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(await audio.startArcadeMusic(0.36)).toBe(true);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0].volume).toBe(0.36);
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(2);
  });

  it("reloads music after a media error and retries on a later call", async () => {
    await audio.startArcadeMusic(0.4);
    const music = FakeAudio.instances[0];
    music.error = { code: 2 };
    music.paused = true;

    expect(await audio.startArcadeMusic(0.4)).toBe(true);
    expect(music.load).toHaveBeenCalledOnce();
    expect(music.play).toHaveBeenCalledTimes(2);
  });

  it("updates music volume while playing and safely stops playback", async () => {
    await audio.startArcadeMusic(0.5);
    audio.setArcadeMusicVolume(0.8);

    expect(FakeAudio.instances[0].volume).toBe(0.8);
    audio.stopArcadeMusic();
    expect(FakeAudio.instances[0].pause).toHaveBeenCalledOnce();
    expect(FakeAudio.instances[0].currentTime).toBe(0);
  });

  it("clamps invalid music volume values", async () => {
    audio.setArcadeMusicVolume(Number.NaN);
    await audio.startArcadeMusic();

    expect(FakeAudio.instances[0].volume).toBe(0);
  });
});
