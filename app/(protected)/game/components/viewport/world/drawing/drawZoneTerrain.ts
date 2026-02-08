// components/game/viewport/world/drawing/drawZoneTerrain.ts

import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/gameConstants";
import { ZONE_VISUALS, getZoneAt } from "@/convex/mapZones";
import type { TintFn } from "../utils/tintFactory";

const ZONE_BLOCK_SIZE = 50;

/**
 * Paint zone-based ground colors and subtle grid texture lines.
 */
export function drawZoneTerrain(g: Graphics, t: TintFn): void {
  // Fill ground blocks per zone
  for (let bx = 0; bx < MAP_SIZE; bx += ZONE_BLOCK_SIZE) {
    for (let by = 0; by < MAP_SIZE; by += ZONE_BLOCK_SIZE) {
      const zoneId = getZoneAt(
        bx + ZONE_BLOCK_SIZE / 2,
        by + ZONE_BLOCK_SIZE / 2,
      );
      const vis = ZONE_VISUALS[zoneId];
      g.rect(bx, by, ZONE_BLOCK_SIZE, ZONE_BLOCK_SIZE);
      g.fill({ color: t(vis.grassColor) });
    }
  }

  // Subtle grid lines per zone
  for (let bx = 0; bx < MAP_SIZE; bx += ZONE_BLOCK_SIZE) {
    for (let by = 0; by < MAP_SIZE; by += ZONE_BLOCK_SIZE) {
      const zoneId = getZoneAt(
        bx + ZONE_BLOCK_SIZE / 2,
        by + ZONE_BLOCK_SIZE / 2,
      );
      const vis = ZONE_VISUALS[zoneId];
      g.setStrokeStyle({
        color: t(vis.grassAccent),
        width: 1,
        alpha: 0.25,
      });
      for (let lx = bx; lx < bx + ZONE_BLOCK_SIZE; lx += 18) {
        g.moveTo(lx, by).lineTo(lx, by + ZONE_BLOCK_SIZE);
      }
      for (let ly = by; ly < by + ZONE_BLOCK_SIZE; ly += 18) {
        g.moveTo(bx, ly).lineTo(bx + ZONE_BLOCK_SIZE, ly);
      }
      g.stroke();
    }
  }
}
