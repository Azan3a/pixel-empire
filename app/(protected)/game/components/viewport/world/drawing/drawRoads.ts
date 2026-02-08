// components/game/viewport/world/drawing/drawRoads.ts

import { Graphics } from "pixi.js";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";
import { WATER_LINE_Y } from "@/convex/mapZones";
import type { TintFn } from "../utils/tintFactory";

const HALF = ROAD_WIDTH / 2;
const FULL_SIDEWALK = HALF + SIDEWALK_W;

function drawHorizontalRoads(g: Graphics, t: TintFn): void {
  for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
    if (y - FULL_SIDEWALK > WATER_LINE_Y) continue;

    const roadBottom = Math.min(y + FULL_SIDEWALK, WATER_LINE_Y);
    const roadH = roadBottom - (y - FULL_SIDEWALK);

    // Sidewalk
    g.rect(0, y - FULL_SIDEWALK, MAP_SIZE, roadH);
    g.fill({ color: t(0x9e9e9e) });

    g.setStrokeStyle({ color: t(0x777777), width: 1, alpha: 0.6 });
    g.moveTo(0, y - FULL_SIDEWALK).lineTo(MAP_SIZE, y - FULL_SIDEWALK);
    if (roadBottom === y + FULL_SIDEWALK) {
      g.moveTo(0, y + FULL_SIDEWALK).lineTo(MAP_SIZE, y + FULL_SIDEWALK);
    }
    g.stroke();

    // Asphalt
    const asphaltBottom = Math.min(y + HALF, WATER_LINE_Y);
    g.rect(0, y - HALF, MAP_SIZE, asphaltBottom - (y - HALF));
    g.fill({ color: t(0x3a3a3a) });

    // Lane lines
    g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
    g.moveTo(0, y - HALF + 3).lineTo(MAP_SIZE, y - HALF + 3);
    if (asphaltBottom === y + HALF) {
      g.moveTo(0, y + HALF - 3).lineTo(MAP_SIZE, y + HALF - 3);
    }
    g.stroke();

    // Center dashes
    for (let x = 0; x < MAP_SIZE; x += 28) {
      if (y - 1.5 < WATER_LINE_Y) {
        g.rect(x, y - 1.5, 14, 3);
        g.fill({ color: 0xe8b930, alpha: 0.85 });
      }
    }
  }
}

function drawVerticalRoads(g: Graphics, t: TintFn): void {
  const roadBottom = Math.min(MAP_SIZE, WATER_LINE_Y);

  for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
    // Sidewalk
    g.rect(x - FULL_SIDEWALK, 0, ROAD_WIDTH + SIDEWALK_W * 2, roadBottom);
    g.fill({ color: t(0x9e9e9e) });

    g.setStrokeStyle({ color: t(0x777777), width: 1, alpha: 0.6 });
    g.moveTo(x - FULL_SIDEWALK, 0).lineTo(x - FULL_SIDEWALK, roadBottom);
    g.moveTo(x + FULL_SIDEWALK, 0).lineTo(x + FULL_SIDEWALK, roadBottom);
    g.stroke();

    // Asphalt
    g.rect(x - HALF, 0, ROAD_WIDTH, roadBottom);
    g.fill({ color: t(0x3a3a3a) });

    // Lane lines
    g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
    g.moveTo(x - HALF + 3, 0).lineTo(x - HALF + 3, roadBottom);
    g.moveTo(x + HALF - 3, 0).lineTo(x + HALF - 3, roadBottom);
    g.stroke();

    // Center dashes
    for (let y = 0; y < roadBottom; y += 28) {
      g.rect(x - 1.5, y, 3, 14);
      g.fill({ color: 0xe8b930, alpha: 0.85 });
    }
  }
}

function drawIntersections(g: Graphics, t: TintFn): void {
  const stripeW = 5;
  const stripeGap = 9;

  for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
    for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
      if (iy - HALF > WATER_LINE_Y) continue;

      // Intersection fill
      g.rect(ix - HALF, iy - HALF, ROAD_WIDTH, ROAD_WIDTH);
      g.fill({ color: t(0x3a3a3a) });

      // Top crosswalk
      if (iy - FULL_SIDEWALK >= 0) {
        for (let s = -HALF + 6; s < HALF - 6; s += stripeGap) {
          g.rect(ix + s, iy - FULL_SIDEWALK, stripeW, SIDEWALK_W);
          g.fill({ color: 0xffffff, alpha: 0.65 });
        }
      }

      // Bottom crosswalk
      if (iy + HALF < WATER_LINE_Y) {
        for (let s = -HALF + 6; s < HALF - 6; s += stripeGap) {
          g.rect(ix + s, iy + HALF, stripeW, SIDEWALK_W);
          g.fill({ color: 0xffffff, alpha: 0.65 });
        }
      }

      // Left crosswalk
      for (let s = -HALF + 6; s < HALF - 6; s += stripeGap) {
        g.rect(ix - FULL_SIDEWALK, iy + s, SIDEWALK_W, stripeW);
        g.fill({ color: 0xffffff, alpha: 0.65 });
      }

      // Right crosswalk
      for (let s = -HALF + 6; s < HALF - 6; s += stripeGap) {
        g.rect(ix + HALF, iy + s, SIDEWALK_W, stripeW);
        g.fill({ color: 0xffffff, alpha: 0.65 });
      }
    }
  }
}

/**
 * Draw all roads: horizontal, vertical, and intersections with crosswalks.
 */
export function drawRoads(g: Graphics, t: TintFn): void {
  drawHorizontalRoads(g, t);
  drawVerticalRoads(g, t);
  drawIntersections(g, t);
}
