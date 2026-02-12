// components/game/viewport/world/drawing/drawTrees.ts

import { Graphics } from "pixi.js";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";
import {
  ZONE_VISUALS,
  WATER_LINE_Y,
  getZoneAt,
  type ZoneId,
  ZONES,
} from "@/convex/mapZones";
import { isOnRoad } from "../utils/gridHelpers";
import type { TintFn } from "../utils/tintFactory";

// ── Spacing & distribution constants ──

/** Minimum distance between any two tree centers (prevents clustering) */
const MIN_TREE_SPACING = 28;

/** Margin from road edges where trees cannot be placed */
const ROAD_MARGIN = ROAD_WIDTH / 2 + SIDEWALK_W + 12;

/** Margin from block edges */
const BLOCK_MARGIN = 20;

// ── Deterministic hash for tree positions ──

/**
 * High-quality seeded hash returning 0–1.
 * Uses separate prime multipliers per component to avoid axis-aligned patterns.
 */
function hashPosition(x: number, y: number, seed: number): number {
  let h = seed;
  h = ((h ^ (x * 374761393)) + 1013904223) | 0;
  h = ((h ^ (y * 668265263)) + 1013904223) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 0xffffffff;
}

// ── Collision-aware tree placement ──

interface TreePlacement {
  x: number;
  y: number;
  size: number;
  zoneId: ZoneId;
}

/**
 * Generate all tree positions across the map using Poisson-like placement.
 * Trees are placed per block but checked globally for minimum spacing.
 */
function generateTreePlacements(): TreePlacement[] {
  const trees: TreePlacement[] = [];

  // Spatial grid for fast neighbor lookup
  const cellSize = MIN_TREE_SPACING;
  const gridCols = Math.ceil(MAP_SIZE / cellSize);
  const spatialGrid = new Map<number, TreePlacement[]>();

  function gridKey(gx: number, gy: number): number {
    return gy * gridCols + gx;
  }

  function isTooClose(tx: number, ty: number, minDist: number): boolean {
    const gx = Math.floor(tx / cellSize);
    const gy = Math.floor(ty / cellSize);
    const searchRadius = Math.ceil(minDist / cellSize);

    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        const key = gridKey(gx + dx, gy + dy);
        const bucket = spatialGrid.get(key);
        if (!bucket) continue;
        for (const existing of bucket) {
          const distSq = (tx - existing.x) ** 2 + (ty - existing.y) ** 2;
          if (distSq < minDist * minDist) return true;
        }
      }
    }
    return false;
  }

  function addTree(tree: TreePlacement): void {
    trees.push(tree);
    const gx = Math.floor(tree.x / cellSize);
    const gy = Math.floor(tree.y / cellSize);
    const key = gridKey(gx, gy);
    if (!spatialGrid.has(key)) spatialGrid.set(key, []);
    spatialGrid.get(key)!.push(tree);
  }

  // Iterate over each block between road grid lines
  for (let bx = 0; bx < MAP_SIZE; bx += ROAD_SPACING) {
    for (let by = 0; by < MAP_SIZE; by += ROAD_SPACING) {
      // Skip blocks fully below waterline
      if (by >= WATER_LINE_Y) continue;

      const centerX = bx + ROAD_SPACING / 2;
      const centerY = by + ROAD_SPACING / 2;
      const zoneId = getZoneAt(centerX, centerY);

      // Forest trees are now server-driven interactive objects.
      if (zoneId === "forest") continue;

      const vis = ZONE_VISUALS[zoneId];

      if (vis.treeCount === 0) continue;

      // Usable area within the block (avoiding roads and edges)
      const minX = bx + BLOCK_MARGIN;
      const maxX = Math.min(bx + ROAD_SPACING - BLOCK_MARGIN, MAP_SIZE);
      const minY = by + BLOCK_MARGIN;
      const maxY = Math.min(
        by + ROAD_SPACING - BLOCK_MARGIN,
        WATER_LINE_Y - 10,
      );

      if (maxX - minX < 20 || maxY - minY < 20) continue;

      // Attempt to place the zone's target tree count
      // Try multiple candidates per slot to find valid positions
      const maxAttempts = vis.treeCount * 6;
      let placed = 0;

      for (
        let attempt = 0;
        attempt < maxAttempts && placed < vis.treeCount;
        attempt++
      ) {
        const tx = minX + hashPosition(bx, by, attempt * 3 + 0) * (maxX - minX);
        const ty = minY + hashPosition(bx, by, attempt * 3 + 1) * (maxY - minY);

        // Skip if on or too close to a road
        if (isOnRoad(tx, ty)) continue;

        // Extra margin check: ensure tree is far enough from road edges
        if (isNearRoadEdge(tx, ty)) continue;

        // Skip if overlapping with park features
        if (isNearParkFeature(tx, ty)) continue;

        // Skip if below waterline
        if (ty >= WATER_LINE_Y) continue;

        // Minimum spacing depends on tree size — larger trees need more room
        const sizeRaw = hashPosition(bx, by, attempt * 3 + 2);
        const size =
          vis.treeSizeMin + sizeRaw * (vis.treeSizeMax - vis.treeSizeMin);
        const requiredSpacing = MIN_TREE_SPACING + size * 0.5;

        if (isTooClose(tx, ty, requiredSpacing)) continue;

        addTree({ x: tx, y: ty, size, zoneId });
        placed++;
      }
    }
  }

  return trees;
}

/**
 * Check if a point is within ROAD_MARGIN of any road center line.
 * This provides a buffer zone beyond the road+sidewalk check in isOnRoad.
 */
function isNearRoadEdge(px: number, py: number): boolean {
  for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
    if (Math.abs(py - ry) < ROAD_MARGIN) return true;
  }
  for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
    if (Math.abs(px - rx) < ROAD_MARGIN) return true;
  }
  return false;
}

/**
 * Check if a point overlaps with decorative park features like paths,
 * ponds, fountains, or flower beds.
 */
function isNearParkFeature(px: number, py: number): boolean {
  const b = ZONES.park.bounds;
  // If not in park bounds, skip check
  if (px < b.x1 || px > b.x2 || py < b.y1 || py > b.y2) return false;

  const cx = (b.x1 + b.x2) / 2;
  const cy = (b.y1 + b.y2) / 2;
  const dx = px - cx;
  const dy = py - cy;
  const distSq = dx * dx + dy * dy;

  // 1. Fountain (Center)
  if (distSq < 75 * 75) return true;

  // 2. Circular Path (Radius 280)
  const dist = Math.sqrt(distSq);
  if (Math.abs(dist - 280) < 30) return true;

  // 3. Cross Paths
  if (Math.abs(dx) < 20 || Math.abs(dy) < 20) return true;

  // 4. Benches (near the circular path)
  if (Math.abs(dist - 325) < 25) return true;

  // 5. Flower Beds (cx ± 450, cy ± 450)
  const bedOffsets = [
    [-450, -450],
    [450, -450],
    [-450, 450],
    [450, 450],
  ];
  for (const [ox, oy] of bedOffsets) {
    const fdx = px - (cx + ox);
    const fdy = py - (cy + oy);
    if (fdx * fdx + fdy * fdy < 60 * 60) return true;
  }

  // 6. Ponds
  // Pond 1: (cx + 420, cy - 100), 110 x 70
  const p1dx = (px - (cx + 420)) / 125;
  const p1dy = (py - (cy - 100)) / 85;
  if (p1dx * p1dx + p1dy * p1dy < 1) return true;

  // Pond 2: (cx - 380, cy + 280), 90 x 60
  const p2dx = (px - (cx - 380)) / 105;
  const p2dy = (py - (cy + 280)) / 75;
  if (p2dx * p2dx + p2dy * p2dy < 1) return true;

  return false;
}

// ── Cached placements (computed once since map is deterministic) ──

let cachedPlacements: TreePlacement[] | null = null;

function getTreePlacements(): TreePlacement[] {
  if (!cachedPlacements) {
    cachedPlacements = generateTreePlacements();
  }
  return cachedPlacements;
}

/**
 * Clear the cached tree placements (useful if map constants change during dev).
 */
export function invalidateTreeCache(): void {
  cachedPlacements = null;
}

// ── Drawing ──

/**
 * Draw all decorative trees across the map.
 */
export function drawTrees(g: Graphics, t: TintFn): void {
  const placements = getTreePlacements();

  for (const tree of placements) {
    if (tree.zoneId === "beach") {
      drawPalmTree(g, t, tree.x, tree.y, tree.size);
    } else {
      drawCanopyTree(g, t, tree.x, tree.y, tree.size, tree.zoneId);
    }
  }
}

// ── Tree renderers ──

function drawPalmTree(
  g: Graphics,
  t: TintFn,
  tx: number,
  ty: number,
  size: number,
): void {
  const trunkHeight = size * 1.8;
  const leanX = size * 0.3;

  // Shadow on ground
  g.ellipse(tx + leanX + 2, ty + size + 3, size * 0.8, size * 0.3);
  g.fill({ color: t(0x1a3a1a), alpha: 0.15 });

  // Curved trunk
  g.setStrokeStyle({ color: t(0x8b6b4a), width: 3.5, alpha: 0.85 });
  g.moveTo(tx, ty + size);
  // Quadratic curve for a slight lean
  g.quadraticCurveTo(
    tx + leanX * 0.5,
    ty + size - trunkHeight * 0.5,
    tx + leanX,
    ty - size * 0.5,
  );
  g.stroke();

  // Trunk segments (coconut palm texture)
  g.setStrokeStyle({ color: t(0x6b4a2a), width: 1, alpha: 0.3 });
  const segments = 5;
  for (let si = 1; si < segments; si++) {
    const frac = si / segments;
    const segX = tx + leanX * frac;
    const segY = ty + size - trunkHeight * frac;
    g.moveTo(segX - 2, segY).lineTo(segX + 2, segY);
  }
  g.stroke();

  // Frond crown — multiple overlapping ellipses for a fuller look
  const crownX = tx + leanX;
  const crownY = ty - size * 0.6;
  const frondAngles = [-0.8, -0.3, 0.2, 0.7, -1.2, 1.1];

  for (const angle of frondAngles) {
    const fx = crownX + Math.cos(angle) * size * 0.4;
    const fy = crownY + Math.sin(angle) * size * 0.2;
    g.ellipse(fx, fy, size * 0.9, size * 0.25);
    g.fill({ color: t(0x3a8a3a), alpha: 0.55 });
  }

  // Central crown highlight
  g.circle(crownX, crownY, size * 0.3);
  g.fill({ color: t(0x4aaa4a), alpha: 0.4 });
}

function drawCanopyTree(
  g: Graphics,
  t: TintFn,
  tx: number,
  ty: number,
  size: number,
  zoneId: string,
): void {
  const trunkColor = 0x5c3a1a;
  const canopyDark =
    zoneId === "forest" ? 0x1a4a1a : zoneId === "park" ? 0x2a7a2a : 0x2d8a2d;
  const canopyLight =
    zoneId === "forest" ? 0x2a6a2a : zoneId === "park" ? 0x3aa03a : 0x3ca03c;
  const canopyMid =
    zoneId === "forest" ? 0x225a22 : zoneId === "park" ? 0x329032 : 0x349634;

  // Ground shadow
  g.ellipse(tx + 3, ty + size * 0.8, size * 1.1, size * 0.45);
  g.fill({ color: t(0x1a3a1a), alpha: 0.18 });

  // Trunk
  const trunkW = Math.max(2, size * 0.25);
  const trunkH = size * 0.6;
  g.rect(tx - trunkW / 2, ty, trunkW, trunkH);
  g.fill({ color: t(trunkColor), alpha: 0.85 });

  // Main canopy — layered circles for organic shape
  g.circle(tx, ty - size * 0.1, size);
  g.fill({ color: t(canopyDark), alpha: 0.7 });

  // Secondary canopy blob offset slightly
  g.circle(tx - size * 0.25, ty - size * 0.2, size * 0.75);
  g.fill({ color: t(canopyMid), alpha: 0.55 });

  // Highlight
  g.circle(tx - size * 0.15, ty - size * 0.3, size * 0.5);
  g.fill({ color: t(canopyLight), alpha: 0.45 });

  // Small edge detail for larger trees
  if (size > 10) {
    g.circle(tx + size * 0.4, ty + size * 0.1, size * 0.35);
    g.fill({ color: t(canopyDark), alpha: 0.4 });
  }
}
