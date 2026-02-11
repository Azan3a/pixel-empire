// components/game/viewport/world/utils/gridHelpers.ts
// Road-awareness helpers using zone-defined road segments.

import { ROAD_STYLES } from "@/convex/map/constants";
import { getAllRoads, type ZoneRoad } from "@/convex/map/zones/index";

// ── Cached flat list of all zone road segments ──
let _roadCache: ZoneRoad[] | null = null;
function getRoads(): ZoneRoad[] {
  if (!_roadCache) _roadCache = getAllRoads();
  return _roadCache;
}

/**
 * Deterministic pseudo-random number from grid coordinates and index.
 */
export function seeded(x: number, y: number, i: number): number {
  return (((x + i) * 7919 + (y + i) * 104729 + i * 31) % 1000) / 1000;
}

/**
 * Check whether a world-space pixel falls on any road (surface + sidewalk).
 * Uses zone-defined road segments instead of the old uniform grid.
 */
export function isOnRoad(px: number, py: number): boolean {
  for (const road of getRoads()) {
    const style = ROAD_STYLES[road.style];
    if (!style) continue;
    const halfCorridor = style.corridor / 2;

    // Horizontal segment
    if (road.y1 === road.y2) {
      const minX = Math.min(road.x1, road.x2);
      const maxX = Math.max(road.x1, road.x2);
      if (
        px >= minX - halfCorridor &&
        px <= maxX + halfCorridor &&
        py >= road.y1 - halfCorridor &&
        py <= road.y1 + halfCorridor
      ) {
        return true;
      }
    }
    // Vertical segment
    else if (road.x1 === road.x2) {
      const minY = Math.min(road.y1, road.y2);
      const maxY = Math.max(road.y1, road.y2);
      if (
        px >= road.x1 - halfCorridor &&
        px <= road.x1 + halfCorridor &&
        py >= minY - halfCorridor &&
        py <= maxY + halfCorridor
      ) {
        return true;
      }
    }
    // Diagonal segment (rare — only small island dock path)
    else {
      const dx = road.x2 - road.x1;
      const dy = road.y2 - road.y1;
      const lenSq = dx * dx + dy * dy;
      const t = Math.max(
        0,
        Math.min(1, ((px - road.x1) * dx + (py - road.y1) * dy) / lenSq),
      );
      const cx = road.x1 + t * dx;
      const cy = road.y1 + t * dy;
      const dist = Math.hypot(px - cx, py - cy);
      if (dist <= halfCorridor) return true;
    }
  }
  return false;
}
