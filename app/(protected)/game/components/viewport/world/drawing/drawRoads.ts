// components/game/viewport/world/drawing/drawRoads.ts
// Draws road segments from zone data using per-zone road styles.

import { Graphics } from "pixi.js";
import { ROAD_STYLES, type RoadStyle } from "@/convex/map/constants";
import { ALL_ZONE_DATA, type ZoneRoad } from "@/convex/map/zones/index";
import type { ZoneId } from "@/convex/map/zones";
import { ZONES } from "@/convex/map/zones";
import type { TintFn } from "../utils/tintFactory";

// ── Cached road list with resolved styles ──

interface ResolvedRoad {
  road: ZoneRoad;
  style: RoadStyle;
}

let _cache: ResolvedRoad[] | null = null;
function getResolvedRoads(): ResolvedRoad[] {
  if (!_cache) {
    _cache = [];
    for (const [zoneId, data] of Object.entries(ALL_ZONE_DATA)) {
      const zone = ZONES[zoneId as ZoneId];
      for (const road of data.roads) {
        const style = ROAD_STYLES[road.style] ?? ROAD_STYLES[zone.roadStyle];
        if (style) _cache.push({ road, style });
      }
    }
  }
  return _cache;
}

// ── Draw a single road segment ──

function drawSegment(
  g: Graphics,
  t: TintFn,
  road: ZoneRoad,
  style: RoadStyle,
): void {
  const halfW = style.width / 2;
  const halfC = style.corridor / 2;
  const isH = road.y1 === road.y2;
  const isV = road.x1 === road.x2;

  if (isH) {
    const minX = Math.min(road.x1, road.x2);
    const maxX = Math.max(road.x1, road.x2);
    const len = maxX - minX;
    const y = road.y1;

    // Sidewalk
    if (style.sidewalk > 0) {
      g.rect(minX, y - halfC, len, style.corridor);
      g.fill({ color: t(style.sidewalkColor) });
      // Sidewalk edge lines
      g.setStrokeStyle({
        color: t(darken(style.sidewalkColor, 0.15)),
        width: 1,
        alpha: 0.5,
      });
      g.moveTo(minX, y - halfC).lineTo(maxX, y - halfC);
      g.moveTo(minX, y + halfC).lineTo(maxX, y + halfC);
      g.stroke();
    }

    // Asphalt surface
    g.rect(minX, y - halfW, len, style.width);
    g.fill({ color: t(style.color) });

    // Lane markings
    if (style.laneMarkings) {
      g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.25 });
      g.moveTo(minX, y - halfW + 3).lineTo(maxX, y - halfW + 3);
      g.moveTo(minX, y + halfW - 3).lineTo(maxX, y + halfW - 3);
      g.stroke();
      // Center dashes
      for (let dx = minX; dx < maxX; dx += 28) {
        g.rect(dx, y - 1.5, 14, 3);
        g.fill({ color: 0xe8b930, alpha: 0.75 });
      }
    }
  } else if (isV) {
    const minY = Math.min(road.y1, road.y2);
    const maxY = Math.max(road.y1, road.y2);
    const len = maxY - minY;
    const x = road.x1;

    // Sidewalk
    if (style.sidewalk > 0) {
      g.rect(x - halfC, minY, style.corridor, len);
      g.fill({ color: t(style.sidewalkColor) });
      g.setStrokeStyle({
        color: t(darken(style.sidewalkColor, 0.15)),
        width: 1,
        alpha: 0.5,
      });
      g.moveTo(x - halfC, minY).lineTo(x - halfC, maxY);
      g.moveTo(x + halfC, minY).lineTo(x + halfC, maxY);
      g.stroke();
    }

    // Asphalt surface
    g.rect(x - halfW, minY, style.width, len);
    g.fill({ color: t(style.color) });

    // Lane markings
    if (style.laneMarkings) {
      g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.25 });
      g.moveTo(x - halfW + 3, minY).lineTo(x - halfW + 3, maxY);
      g.moveTo(x + halfW - 3, minY).lineTo(x + halfW - 3, maxY);
      g.stroke();
      for (let dy = minY; dy < maxY; dy += 28) {
        g.rect(x - 1.5, dy, 3, 14);
        g.fill({ color: 0xe8b930, alpha: 0.75 });
      }
    }
  } else {
    // Diagonal road — draw as thick line
    g.setStrokeStyle({ color: t(style.color), width: style.width, alpha: 1 });
    g.moveTo(road.x1, road.y1).lineTo(road.x2, road.y2);
    g.stroke();
  }
}

// ── Find & draw intersections where roads cross ──

interface Intersection {
  x: number;
  y: number;
  size: number;
  style: RoadStyle;
}

function findIntersections(): Intersection[] {
  const roads = getResolvedRoads();
  const intersections: Intersection[] = [];

  for (let i = 0; i < roads.length; i++) {
    const a = roads[i];
    const isAH = a.road.y1 === a.road.y2;
    const isAV = a.road.x1 === a.road.x2;
    if (!isAH && !isAV) continue;

    for (let j = i + 1; j < roads.length; j++) {
      const b = roads[j];
      const isBH = b.road.y1 === b.road.y2;
      const isBV = b.road.x1 === b.road.x2;
      if (!isBH && !isBV) continue;

      // Need one H + one V
      const h = isAH ? a : isBH ? b : null;
      const v = isAV ? a : isBV ? b : null;
      if (!h || !v || h === v) continue;

      // Check if they cross
      const hy = h.road.y1;
      const hMinX = Math.min(h.road.x1, h.road.x2);
      const hMaxX = Math.max(h.road.x1, h.road.x2);
      const vx = v.road.x1;
      const vMinY = Math.min(v.road.y1, v.road.y2);
      const vMaxY = Math.max(v.road.y1, v.road.y2);

      if (vx >= hMinX && vx <= hMaxX && hy >= vMinY && hy <= vMaxY) {
        const bigStyle = h.style.width >= v.style.width ? h.style : v.style;
        intersections.push({
          x: vx,
          y: hy,
          size: Math.max(h.style.width, v.style.width),
          style: bigStyle,
        });
      }
    }
  }
  return intersections;
}

let _ixCache: Intersection[] | null = null;

function drawIntersections(g: Graphics, t: TintFn): void {
  if (!_ixCache) _ixCache = findIntersections();
  const stripeW = 5;
  const stripeGap = 9;

  for (const ix of _ixCache) {
    const half = ix.size / 2;

    // Intersection fill
    g.rect(ix.x - half, ix.y - half, ix.size, ix.size);
    g.fill({ color: t(ix.style.color) });

    // Crosswalks
    if (!ix.style.crosswalks) continue;
    const sw = ix.style.sidewalk;
    if (sw <= 0) continue;

    // Top
    for (let s = -half + 6; s < half - 6; s += stripeGap) {
      g.rect(ix.x + s, ix.y - half - sw, stripeW, sw);
      g.fill({ color: 0xffffff, alpha: 0.6 });
    }
    // Bottom
    for (let s = -half + 6; s < half - 6; s += stripeGap) {
      g.rect(ix.x + s, ix.y + half, stripeW, sw);
      g.fill({ color: 0xffffff, alpha: 0.6 });
    }
    // Left
    for (let s = -half + 6; s < half - 6; s += stripeGap) {
      g.rect(ix.x - half - sw, ix.y + s, sw, stripeW);
      g.fill({ color: 0xffffff, alpha: 0.6 });
    }
    // Right
    for (let s = -half + 6; s < half - 6; s += stripeGap) {
      g.rect(ix.x + half, ix.y + s, sw, stripeW);
      g.fill({ color: 0xffffff, alpha: 0.6 });
    }
  }
}

// ── Utility ──

/** Darken a hex color by a fraction (0–1). */
function darken(hex: number, amount: number): number {
  const r = Math.max(0, ((hex >> 16) & 0xff) * (1 - amount)) | 0;
  const gn = Math.max(0, ((hex >> 8) & 0xff) * (1 - amount)) | 0;
  const b = Math.max(0, (hex & 0xff) * (1 - amount)) | 0;
  return (r << 16) | (gn << 8) | b;
}

// ── Public entry point ──

/**
 * Draw all zone-defined road segments with per-zone styling + intersections.
 */
export function drawRoads(g: Graphics, t: TintFn): void {
  for (const { road, style } of getResolvedRoads()) {
    drawSegment(g, t, road, style);
  }
  drawIntersections(g, t);
}
