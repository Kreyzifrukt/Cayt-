export function randomDifferentIndex(current: number, length: number, random = Math.random): number {
  if (length <= 1) return current;
  const candidate = Math.floor(Math.max(0, Math.min(0.999999999, random())) * (length - 1));
  return candidate >= current ? candidate + 1 : candidate;
}


export function isBeforeDeadline(now: number, deadline: number): boolean {
  return Number.isFinite(now) && Number.isFinite(deadline) && now < deadline;
}

export function meetsReactionTarget(elapsedMs: number, targetMs = 300): boolean {
  return Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < targetMs;
}
