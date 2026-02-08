// components/game/viewport/world/property/propertyDrawHelpers.ts

import { tintColor } from "../utils/colorUtils";

/**
 * Deterministic check for whether a window should be "lit" at night.
 */
export function isWindowLit(
  px: number,
  py: number,
  wx: number,
  wy: number,
): boolean {
  const hash = ((px + wx) * 7919 + (py + wy) * 104729) % 100;
  return hash < 55;
}

/** Brightness factor from sunlight intensity. */
export function brightnessFactor(sunlightIntensity: number): number {
  return 0.4 + sunlightIntensity * 0.6;
}

export { tintColor };
