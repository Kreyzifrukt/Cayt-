const AUDIO_BASE = "https://raw.githubusercontent.com/GeorgeQLe/assets-sfx-ui/main/assets/kenney/interface-sounds/Audio/";

const AUDIO_FILES = {
  click: "click_001.ogg",
  win: "confirmation_001.ogg",
  lose: "error_001.ogg",
  reward: "bong_001.ogg",
} as const;

export type ArcadeSound = keyof typeof AUDIO_FILES;

const audioCache = new Map<ArcadeSound, HTMLAudioElement>();
const MUSIC_URL = "https://raw.githubusercontent.com/blancmathis/Super_Bash_Folds/1028a3b739ef54efdcbe5a2ef0ad1714fe569c47/public/assets/audio/open/music/menu-loop.ogg";
let backgroundMusic: HTMLAudioElement | null = null;

/**
 * Kenney Interface Sounds, CC0 1.0.
 * Small OGG effects are loaded by the browser on demand.
 */
export function playArcadeSound(sound: ArcadeSound, volume = 0.65): void {
  if (typeof window === "undefined" || typeof Audio === "undefined") return;
  const level = Math.max(0, Math.min(1, volume));
  if (level === 0) return;
  let audio = audioCache.get(sound);
  if (!audio) {
    audio = new Audio(`${AUDIO_BASE}${AUDIO_FILES[sound]}`);
    audio.preload = "none";
    audioCache.set(sound, audio);
  }
  audio.volume = level;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Audio can be blocked by autoplay policy or unavailable offline.
  });
}

/**
 * Menu loop by qubodup, CC0 1.0 (OpenGameArt).
 * Served from a pinned public commit and played directly by the browser.
 */
export async function startArcadeMusic(volume = 0.18): Promise<boolean> {
  if (typeof window === "undefined" || typeof Audio === "undefined") return false;
  if (!backgroundMusic) {
    backgroundMusic = new Audio(MUSIC_URL);
    backgroundMusic.loop = true;
    backgroundMusic.preload = "none";
  }
  backgroundMusic.volume = Math.max(0, Math.min(1, volume));
  if (!backgroundMusic.paused) return true;
  try {
    await backgroundMusic.play();
    return true;
  } catch {
    return false;
  }
}

export function setArcadeMusicVolume(volume: number): void {
  if (!backgroundMusic) return;
  backgroundMusic.volume = Math.max(0, Math.min(1, volume));
}

export function stopArcadeMusic(): void {
  if (!backgroundMusic) return;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}
