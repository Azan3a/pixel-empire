// components/game/viewport/world/drawing/drawTrees.ts

import { Graphics } from "pixi.js";
import { MAP_SIZE, ROAD_SPACING, SIDEWALK_W } from "@/convex/gameConstants";
import { ZONE_VISUALS, WATER_LINE_Y, getZoneAt } from "@/convex/mapZones";
import { seeded, isOnRoad } from "../utils/gridHelpers";
import type { TintFn } from "../utils/tintFactory";

/**
 * Draw decorative trees across zone blocks, respecting roads and water.
 */
export function drawTrees(g: Graphics, t: TintFn): void {
  for (let bx = 0; bx < MAP_SIZE; bx += ROAD_SPACING) {
    for (let by = 0; by < MAP_SIZE; by += ROAD_SPACING) {
      if (by > WATER_LINE_Y) continue;

      const centerX = bx + ROAD_SPACING / 2;
      const centerY = by + ROAD_SPACING / 2;
      const zoneId = getZoneAt(centerX, centerY);
      const vis = ZONE_VISUALS[zoneId];

      const margin = 50;
      const range = ROAD_SPACING - margin * 2 - SIDEWALK_W * 2;
      if (range <= 0) continue;

      for (let ti = 0; ti < vis.treeCount; ti++) {
        const tx = bx + margin + seeded(bx, by, ti * 3) * range;
        const ty = by + margin + seeded(bx, by, ti * 3 + 1) * range;
        const sizeRaw = seeded(bx, by, ti * 3 + 2);
        const size =
          vis.treeSizeMin + sizeRaw * (vis.treeSizeMax - vis.treeSizeMin);

        if (isOnRoad(tx, ty)) continue;
        if (ty > WATER_LINE_Y) continue;

        if (zoneId === "beach") {
          drawPalmTree(g, t, tx, ty, size);
        } else {
          drawCanopyTree(g, t, tx, ty, size, zoneId);
        }
      }
    }
  }
}

function drawPalmTree(
  g: Graphics,
  t: TintFn,
  tx: number,
  ty: number,
  size: number,
): void {
  // Trunk
  g.setStrokeStyle({ color: t(0x8b6b4a), width: 3, alpha: 0.8 });
  g.moveTo(tx, ty + size).lineTo(tx + 2, ty - size * 0.5);
  g.stroke();

  // Fronds
  g.ellipse(tx + 2, ty - size * 0.6, size * 1.2, size * 0.5);
  g.fill({ color: t(0x3a8a3a), alpha: 0.7 });
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

  // Shadow
  g.ellipse(tx + 3, ty + 3, size, size * 0.7);
  g.fill({ color: t(0x1a3a1a), alpha: 0.2 });

  // Canopy
  g.circle(tx, ty, size);
  g.fill({ color: t(canopyDark), alpha: 0.75 });

  // Highlight
  g.circle(tx - 1, ty - 1, size * 0.6);
  g.fill({ color: t(canopyLight), alpha: 0.5 });

  // Trunk center
  g.circle(tx, ty, 2);
  g.fill({ color: t(trunkColor) });
}
