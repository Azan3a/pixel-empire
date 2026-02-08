// components/game/viewport/world/drawing/drawBeachAndWater.ts

import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/gameConstants";
import {
  ZONES,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
} from "@/convex/mapZones";
import { lerpColor } from "../utils/colorUtils";
import type { TintFn } from "../utils/tintFactory";

/**
 * Draw beach sand gradient, boardwalk, ocean water, waves, and shore foam.
 */
export function drawBeachAndWater(g: Graphics, t: TintFn): void {
  const beachBounds = ZONES.beach.bounds;

  // ── Beach sand gradient ──
  const sandSteps = 8;
  const sandHeight = (WATER_LINE_Y - beachBounds.y1) / sandSteps;
  for (let si = 0; si < sandSteps; si++) {
    const progress = si / sandSteps;
    const sandColor = lerpColor(0xd4b483, 0xf0e4c8, progress);
    g.rect(
      beachBounds.x1,
      beachBounds.y1 + si * sandHeight,
      beachBounds.x2 - beachBounds.x1,
      sandHeight + 1,
    );
    g.fill({ color: t(sandColor) });
  }

  // ── Boardwalk ──
  const bwY = BOARDWALK_Y - BOARDWALK_HEIGHT / 2;
  g.rect(0, bwY, MAP_SIZE, BOARDWALK_HEIGHT);
  g.fill({ color: t(0x8b6b4a) });

  // Plank lines
  g.setStrokeStyle({ color: t(0x6b4a2a), width: 1, alpha: 0.4 });
  for (let px = 0; px < MAP_SIZE; px += 12) {
    g.moveTo(px, bwY).lineTo(px, bwY + BOARDWALK_HEIGHT);
  }
  g.stroke();

  // Rail edges
  g.setStrokeStyle({ color: t(0x5c3a1a), width: 2, alpha: 0.6 });
  g.moveTo(0, bwY).lineTo(MAP_SIZE, bwY);
  g.moveTo(0, bwY + BOARDWALK_HEIGHT).lineTo(MAP_SIZE, bwY + BOARDWALK_HEIGHT);
  g.stroke();

  // ── Ocean water ──
  g.rect(0, WATER_LINE_Y, MAP_SIZE, MAP_SIZE - WATER_LINE_Y);
  g.fill({ color: t(0x1a6b8a) });

  // Wave lines
  g.setStrokeStyle({ color: t(0x2a8aaa), width: 1.5, alpha: 0.3 });
  for (let wy = WATER_LINE_Y + 15; wy < MAP_SIZE; wy += 30) {
    g.moveTo(0, wy);
    for (let wx = 0; wx < MAP_SIZE; wx += 40) {
      g.lineTo(wx + 20, wy - 4);
      g.lineTo(wx + 40, wy);
    }
  }
  g.stroke();

  // Shore foam
  g.setStrokeStyle({ color: 0xffffff, width: 2, alpha: 0.15 });
  g.moveTo(0, WATER_LINE_Y);
  for (let wx = 0; wx < MAP_SIZE; wx += 30) {
    g.lineTo(wx + 15, WATER_LINE_Y - 3);
    g.lineTo(wx + 30, WATER_LINE_Y);
  }
  g.stroke();
}
