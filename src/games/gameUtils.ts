export function randomDifferentIndex(current: number, length: number, random = Math.random): number {
  if (length <= 1) return current;
  const candidate = Math.floor(Math.max(0, Math.min(0.999999999, random())) * (length - 1));
  return candidate >= current ? candidate + 1 : candidate;
}
