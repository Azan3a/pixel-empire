// components/game/viewport/world/drawing/drawZoneTerrain.ts

import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/map/constants";
import { ZONE_VISUALS, getZoneAt } from "@/convex/map/zones";
import type { TintFn } from "../utils/tintFactory";

/**
 * Standard block size for interior zone painting.
 * At zone boundaries we subdivide further for accurate coloring.
 */
const BLOCK_SIZE = 50;

/**
 * Minimum block size when subdividing at zone edges.
 * Smaller = more accurate but more draw calls.
 */
const MIN_BLOCK_SIZE = 10;

/**
 * Check if all four corners of a rect share the same zone.
 */
function isUniformZone(x: number, y: number, w: number, h: number): boolean {
  const z = getZoneAt(x, y);
  return (
    getZoneAt(x + w, y) === z &&
    getZoneAt(x, y + h) === z &&
    getZoneAt(x + w, y + h) === z
  );
}

/**
 * Recursively paint a rectangular area. If all corners share a zone,
 * fill the whole rect. Otherwise subdivide until we reach MIN_BLOCK_SIZE.
 */
function paintZoneRect(
  g: Graphics,
  t: TintFn,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  // Clamp to map bounds
  const cx = Math.max(0, x);
  const cy = Math.max(0, y);
  const cw = Math.min(MAP_SIZE - cx, w - (cx - x));
  const ch = Math.min(MAP_SIZE - cy, h - (cy - y));
  if (cw <= 0 || ch <= 0) return;

  const zoneId = getZoneAt(cx + cw / 2, cy + ch / 2);

  if (
    isUniformZone(cx, cy, cw, ch) ||
    (cw <= MIN_BLOCK_SIZE && ch <= MIN_BLOCK_SIZE)
  ) {
    if (!zoneId) {
      // Ocean — paint water
      g.rect(cx, cy, cw, ch);
      g.fill({ color: t(0x1a6b8a) });
      return;
    }
    const vis = ZONE_VISUALS[zoneId];
    g.rect(cx, cy, cw, ch);
    g.fill({ color: t(vis.grassColor) });
    return;
  }

  // Subdivide into 4 quadrants
  const hw = Math.ceil(cw / 2);
  const hh = Math.ceil(ch / 2);
  paintZoneRect(g, t, cx, cy, hw, hh);
  paintZoneRect(g, t, cx + hw, cy, cw - hw, hh);
  paintZoneRect(g, t, cx, cy + hh, hw, ch - hh);
  paintZoneRect(g, t, cx + hw, cy + hh, cw - hw, ch - hh);
}

/**
 * Paint zone ground colors with adaptive subdivision at zone boundaries,
 * then overlay subtle grid texture lines.
 */
export function drawZoneTerrain(g: Graphics, t: TintFn): void {
  // ── Adaptive zone fill ──
  for (let bx = 0; bx < MAP_SIZE; bx += BLOCK_SIZE) {
    for (let by = 0; by < MAP_SIZE; by += BLOCK_SIZE) {
      const w = Math.min(BLOCK_SIZE, MAP_SIZE - bx);
      const h = Math.min(BLOCK_SIZE, MAP_SIZE - by);
      paintZoneRect(g, t, bx, by, w, h);
    }
  }

  // ── Grid texture lines ──
  // We use the same block size but sample zone at center for texture color
  for (let bx = 0; bx < MAP_SIZE; bx += BLOCK_SIZE) {
    for (let by = 0; by < MAP_SIZE; by += BLOCK_SIZE) {
      const w = Math.min(BLOCK_SIZE, MAP_SIZE - bx);
      const h = Math.min(BLOCK_SIZE, MAP_SIZE - by);
      const zoneId = getZoneAt(bx + w / 2, by + h / 2);
      if (!zoneId) continue;
      const vis = ZONE_VISUALS[zoneId];

      g.setStrokeStyle({
        color: t(vis.grassAccent),
        width: 1,
        alpha: 0.25,
      });

      for (let lx = bx; lx < bx + w; lx += 18) {
        g.moveTo(lx, by).lineTo(lx, by + h);
      }
      for (let ly = by; ly < by + h; ly += 18) {
        g.moveTo(bx, ly).lineTo(bx + w, ly);
      }
      g.stroke();
    }
  }
}
