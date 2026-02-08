// components/game/viewport/world/utils/colorUtils.ts

/**
 * Tint a hex color by separate R, G, B multipliers.
 */
export function tintColorRGB(
  color: number,
  r: number,
  g: number,
  b: number,
): number {
  const cr = Math.round(((color >> 16) & 0xff) * r);
  const cg = Math.round(((color >> 8) & 0xff) * g);
  const cb = Math.round((color & 0xff) * b);
  return (
    (Math.min(255, cr) << 16) | (Math.min(255, cg) << 8) | Math.min(255, cb)
  );
}

/**
 * Tint a hex color by a single brightness factor.
 */
export function tintColor(color: number, factor: number): number {
  return tintColorRGB(color, factor, factor, factor);
}

/**
 * Linearly interpolate between two hex colors.
 */
export function lerpColor(c1: number, c2: number, t: number): number {
  const r1 = (c1 >> 16) & 0xff,
    g1 = (c1 >> 8) & 0xff,
    b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff,
    g2 = (c2 >> 8) & 0xff,
    b2 = c2 & 0xff;
  const clamp = Math.max(0, Math.min(1, t));
  const r = Math.round(r1 + (r2 - r1) * clamp);
  const g = Math.round(g1 + (g2 - g1) * clamp);
  const b = Math.round(b1 + (b2 - b1) * clamp);
  return (r << 16) | (g << 8) | b;
}
