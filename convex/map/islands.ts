// convex/map/islands.ts
// ── Island Coastline ──
// Approximated from the ASCII art in overview.md
// The island is roughly 7600 wide × 7000 tall, centered within the 8000×8000 map.
// Points are listed clockwise starting from the top-center.

import { MAP_SIZE } from "./constants";

export interface Point {
  x: number;
  y: number;
}

/**
 * Island coastline polygon (clockwise).
 * All coordinates in world pixels on the 8000×8000 map.
 * The island spans roughly from (600,600) to (8200,7600).
 */
export const COASTLINE_POLYGON: Point[] = [
  // ── Top (north coast) ──
  { x: 2600, y: 600 },
  { x: 3200, y: 500 },
  { x: 4000, y: 450 },
  { x: 4800, y: 500 },
  { x: 5400, y: 600 },

  // ── Top-right (mountains → old town) ──
  { x: 5800, y: 800 },
  { x: 6200, y: 1200 },
  { x: 6600, y: 1400 },
  { x: 6800, y: 1600 },

  // ── Right coast (harbor → boardwalk) ──
  { x: 7200, y: 2000 },
  { x: 7600, y: 2200 },
  { x: 8000, y: 2600 },
  { x: 8200, y: 3200 },
  { x: 8200, y: 4000 },
  { x: 8200, y: 5000 },
  { x: 8200, y: 5800 },
  { x: 8100, y: 6200 },
  { x: 8000, y: 6600 },

  // ── Small island bridge area ──
  { x: 7800, y: 7000 },
  { x: 7400, y: 7200 },

  // ── Bottom-right (wetlands → boardwalk south) ──
  { x: 6800, y: 7400 },
  { x: 6200, y: 7600 },
  { x: 5600, y: 7600 },

  // ── Bottom (boardwalk/resort south coast) ──
  { x: 5000, y: 7600 },
  { x: 4400, y: 7600 },
  { x: 3800, y: 7500 },
  { x: 3200, y: 7400 },

  // ── Bottom-left (farmland south) ──
  { x: 2600, y: 7200 },
  { x: 2000, y: 7000 },
  { x: 1400, y: 6800 },

  // ── Left coast (suburbs → forest) ──
  { x: 800, y: 6200 },
  { x: 600, y: 5600 },
  { x: 500, y: 5000 },
  { x: 500, y: 4400 },
  { x: 500, y: 3800 },
  { x: 500, y: 3200 },
  { x: 600, y: 2600 },
  { x: 600, y: 2000 },
  { x: 700, y: 1400 },
  { x: 900, y: 1000 },
  { x: 1200, y: 700 },
  { x: 1800, y: 550 },
  { x: 2200, y: 500 },
];

/**
 * Small island coastline polygon (separate land mass).
 * Boat required to reach. Located at roughly (8200,6000)→(9000,7200).
 */
export const SMALL_ISLAND_POLYGON: Point[] = [
  { x: 8500, y: 6100 },
  { x: 8700, y: 6200 },
  { x: 8850, y: 6400 },
  { x: 8900, y: 6600 },
  { x: 8900, y: 6800 },
  { x: 8850, y: 7000 },
  { x: 8700, y: 7100 },
  { x: 8500, y: 7150 },
  { x: 8350, y: 7100 },
  { x: 8250, y: 6900 },
  { x: 8250, y: 6700 },
  { x: 8250, y: 6500 },
  { x: 8300, y: 6300 },
  { x: 8400, y: 6150 },
];

// ── Point-in-Polygon (ray casting) ──

function pointInPolygon(px: number, py: number, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Check if a world coordinate is on land (main island OR small island).
 * Used by both server (position validation) and client (movement boundary).
 */
export function isOnLand(x: number, y: number): boolean {
  // Quick bounds check
  if (x < 0 || y < 0 || x > MAP_SIZE || y > MAP_SIZE) return false;
  return (
    pointInPolygon(x, y, COASTLINE_POLYGON) ||
    pointInPolygon(x, y, SMALL_ISLAND_POLYGON)
  );
}

/**
 * Check if a point is on the main island only (excludes small island).
 */
export function isOnMainIsland(x: number, y: number): boolean {
  return pointInPolygon(x, y, COASTLINE_POLYGON);
}

/**
 * Check if a point is on the small island.
 */
export function isOnSmallIsland(x: number, y: number): boolean {
  return pointInPolygon(x, y, SMALL_ISLAND_POLYGON);
}

/**
 * Find the nearest land point to an ocean coordinate (for clamping player position).
 * Samples the coastline polygon edges and returns the closest point on any edge.
 */
export function nearestLandPoint(x: number, y: number): Point {
  let bestDist = Infinity;
  let bestPoint: Point = { x, y };

  function checkPolygon(polygon: Point[]) {
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const a = polygon[i];
      const b = polygon[(i + 1) % n];

      // Project point onto edge segment
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;

      let t = ((x - a.x) * dx + (y - a.y) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));

      const px = a.x + t * dx;
      const py = a.y + t * dy;
      const dist = (x - px) ** 2 + (y - py) ** 2;

      if (dist < bestDist) {
        bestDist = dist;
        // Push slightly inward (5px) so the player lands on land
        const edgeNormalX = -(b.y - a.y);
        const edgeNormalY = b.x - a.x;
        const edgeLen = Math.sqrt(edgeNormalX ** 2 + edgeNormalY ** 2);
        if (edgeLen > 0) {
          bestPoint = {
            x: px + (edgeNormalX / edgeLen) * 5,
            y: py + (edgeNormalY / edgeLen) * 5,
          };
        } else {
          bestPoint = { x: px, y: py };
        }
      }
    }
  }

  checkPolygon(COASTLINE_POLYGON);
  checkPolygon(SMALL_ISLAND_POLYGON);
  return bestPoint;
}
