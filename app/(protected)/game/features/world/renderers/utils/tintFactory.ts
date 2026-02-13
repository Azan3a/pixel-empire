// app/(protected)/game/features/world/renderers/utils/tintFactory.ts

import { tintColorRGB } from "./colorUtils";

export type TintFn = (color: number) => number;

/**
 * Create a tint function bound to specific RGB multipliers.
 */
export function createTintFn(r: number, g: number, b: number): TintFn {
  return (color: number) => tintColorRGB(color, r, g, b);
}
