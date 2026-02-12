// components/game/viewport/world/utils/gridHelpers.ts

import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";

/**
 * Deterministic pseudo-random number from grid coordinates and index.
 */
export function seeded(x: number, y: number, i: number): number {
  return (((x + i) * 7919 + (y + i) * 104729 + i * 31) % 1000) / 1000;
}

/**
 * Check whether a world-space pixel falls on any road or sidewalk strip.
 */
export function isOnRoad(px: number, py: number): boolean {
  const half = ROAD_WIDTH / 2;
  const fullSidewalk = half + SIDEWALK_W;

  for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
    if (py >= ry - fullSidewalk && py <= ry + fullSidewalk) return true;
  }
  for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
    if (px >= rx - fullSidewalk && px <= rx + fullSidewalk) return true;
  }
  return false;
}
