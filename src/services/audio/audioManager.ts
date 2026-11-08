const AUDIO_BASE = "https://raw.githubusercontent.com/GeorgeQLe/assets-sfx-ui/760afd035e8fc3cd7fb5bc58d49a967649875e3e/assets/kenney/interface-sounds/Audio/";

const AUDIO_FILES = {
  click: "click_001.ogg",
  win: "confirmation_001.ogg",
  lose: "error_001.ogg",
  reward: "bong_001.ogg",
} as const;

export type ArcadeSound = keyof typeof AUDIO_FILES;

const MAX_EFFECT_VOICES = 4;
const audioCache = new Map<ArcadeSound, HTMLAudioElement[]>();
const nextVoiceIndex = new Map<ArcadeSound, number>();
const MUSIC_URL = "https://raw.githubusercontent.com/blancmathis/Super_Bash_Folds/1028a3b739ef54efdcbe5a2ef0ad1714fe569c47/public/assets/audio/open/music/menu-loop.ogg";

let backgroundMusic: HTMLAudioElement | null = null;
let musicVolume = 0.18;

function clampVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
}

function getEffectVoice(sound: ArcadeSound): HTMLAudioElement {
  const voices = audioCache.get(sound) ?? [];
  const available = voices.findIndex(audio => audio.paused || audio.ended);

  if (available !== -1) {
    nextVoiceIndex.set(sound, (available + 1) % MAX_EFFECT_VOICES);
    return voices[available];
  }

  if (voices.length < MAX_EFFECT_VOICES) {
    const audio = new Audio(`${AUDIO_BASE}${AUDIO_FILES[sound]}`);
    audio.preload = "none";
    voices.push(audio);
    audioCache.set(sound, voices);
    nextVoiceIndex.set(sound, voices.length % MAX_EFFECT_VOICES);
    return audio;
  }

  const index = nextVoiceIndex.get(sound) ?? 0;
  nextVoiceIndex.set(sound, (index + 1) % MAX_EFFECT_VOICES);
  return voices[index];
}

/**
 * Kenney Interface Sounds, CC0 1.0.
 * Each effect has a small voice pool so rapid repeated actions can overlap.
 */
export function playArcadeSound(sound: ArcadeSound, volume = 0.65): void {
  if (typeof window === "undefined" || typeof Audio === "undefined") return;
  const level = clampVolume(volume);
  if (level === 0) return;

  const audio = getEffectVoice(sound);
  audio.volume = level;

  try {
    audio.currentTime = 0;
  } catch {
    // Some browsers reject seeking before media metadata has loaded.
  }

  void audio.play().catch(() => {
    // Audio can be blocked by autoplay policy or unavailable offline.
  });
}

/**
 * Menu loop by qubodup, CC0 1.0 (OpenGameArt).
 * The current volume is retained even before the media element is created.
 */
export async function startArcadeMusic(volume = musicVolume): Promise<boolean> {
  if (typeof window === "undefined" || typeof Audio === "undefined") return false;

  musicVolume = clampVolume(volume);
  if (!backgroundMusic) {
    backgroundMusic = new Audio(MUSIC_URL);
    backgroundMusic.loop = true;
    backgroundMusic.preload = "none";
  }

  backgroundMusic.volume = musicVolume;
  if (!backgroundMusic.paused) return true;

  try {
    await backgroundMusic.play();
    return true;
  } catch {
    // Keep the user's preference. The caller can retry on the next gesture.
    return false;
  }
}

export function setArcadeMusicVolume(volume: number): void {
  musicVolume = clampVolume(volume);
  if (backgroundMusic) backgroundMusic.volume = musicVolume;
}

export function stopArcadeMusic(): void {
  if (!backgroundMusic) return;
  backgroundMusic.pause();
  try {
    backgroundMusic.currentTime = 0;
  } catch {
    // Resetting an unloaded media element is not supported in every browser.
  }
}
