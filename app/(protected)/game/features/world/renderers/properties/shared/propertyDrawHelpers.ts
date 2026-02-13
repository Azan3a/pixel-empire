import { tintColor } from "@game/features/world/renderers/utils/colorUtils";

export function isWindowLit(
  px: number,
  py: number,
  wx: number,
  wy: number,
): boolean {
  const hash = ((px + wx) * 7919 + (py + wy) * 104729) % 100;
  return hash < 55;
}

export function brightnessFactor(sunlightIntensity: number): number {
  return 0.4 + sunlightIntensity * 0.6;
}

export function stableHash(a: number, b: number, seed: number): number {
  let h = seed;
  h = ((h ^ (a * 374761393)) + 1013904223) | 0;
  h = ((h ^ (b * 668265263)) + 1013904223) | 0;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 0xffffffff;
}

export { tintColor };
