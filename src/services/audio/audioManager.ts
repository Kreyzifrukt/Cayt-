const AUDIO_BASE = "https://raw.githubusercontent.com/GeorgeQLe/assets-sfx-ui/main/assets/kenney/interface-sounds/Audio/";

const AUDIO_FILES = {
  click: "click_001.ogg",
  win: "confirmation_001.ogg",
  lose: "error_001.ogg",
  reward: "bong_001.ogg",
} as const;

export type ArcadeSound = keyof typeof AUDIO_FILES;

const audioCache = new Map<ArcadeSound, HTMLAudioElement>();

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
