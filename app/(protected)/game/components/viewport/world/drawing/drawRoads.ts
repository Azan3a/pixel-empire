// components/game/viewport/world/drawing/drawRoads.ts

import { Graphics } from "pixi.js";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";
import { WATER_LINE_Y, getZoneAt, ZONES } from "@/convex/mapZones";
import type { TintFn } from "../utils/tintFactory";

const HALF = ROAD_WIDTH / 2;
const FULL_SIDEWALK = HALF + SIDEWALK_W;

function drawHorizontalRoads(g: Graphics, t: TintFn): void {
  for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
    if (y - FULL_SIDEWALK > WATER_LINE_Y) continue;

    const roadBottom = Math.min(y + FULL_SIDEWALK, WATER_LINE_Y);
    const roadH = roadBottom - (y - FULL_SIDEWALK);
    const asphaltBottom = Math.min(y + HALF, WATER_LINE_Y);

    let segmentStart = -1;

    // Helper to draw segment
    const drawSegment = (start: number, end: number) => {
      // Sidewalk
      g.rect(start, y - FULL_SIDEWALK, end - start, roadH);
      g.fill({ color: t(0x9e9e9e) });

      g.setStrokeStyle({ color: t(0x777777), width: 1, alpha: 0.6 });
      g.moveTo(start, y - FULL_SIDEWALK).lineTo(end, y - FULL_SIDEWALK);
      if (roadBottom === y + FULL_SIDEWALK) {
        g.moveTo(start, y + FULL_SIDEWALK).lineTo(end, y + FULL_SIDEWALK);
      }
      g.stroke();

      // Asphalt
      if (asphaltBottom > y - HALF) {
        g.rect(start, y - HALF, end - start, asphaltBottom - (y - HALF));
        g.fill({ color: t(0x3a3a3a) });

        // Lane lines
        g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
        g.moveTo(start, y - HALF + 3).lineTo(end, y - HALF + 3);
        if (asphaltBottom === y + HALF) {
          g.moveTo(start, y + HALF - 3).lineTo(end, y + HALF - 3);
        }
        g.stroke();

        // Center dashes
        for (let dx = start; dx < end; dx += 28) {
          if (y - 1.5 < WATER_LINE_Y) {
            g.rect(dx, y - 1.5, 14, 3);
            g.fill({ color: 0xe8b930, alpha: 0.85 });
          }
        }
      }
    };

    for (let x = 0; x < MAP_SIZE; x += ROAD_SPACING) {
      // Check if either side of the road line allows roads
      const zUp = getZoneAt(x + ROAD_SPACING / 2, y - 1);
      const zDown = getZoneAt(x + ROAD_SPACING / 2, y + 1);
      const hasRoads = ZONES[zUp].hasRoads || ZONES[zDown].hasRoads;

      if (hasRoads) {
        if (segmentStart === -1) segmentStart = x;
      } else {
        if (segmentStart !== -1) {
          drawSegment(segmentStart, x);
          segmentStart = -1;
        }
      }
    }

    if (segmentStart !== -1) {
      drawSegment(segmentStart, MAP_SIZE);
    }
  }
}

function drawVerticalRoads(g: Graphics, t: TintFn): void {
  const roadBottomMap = Math.min(MAP_SIZE, WATER_LINE_Y);

  for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
    let segmentStart = -1;

    const drawSegment = (start: number, end: number) => {
      const segEnd = Math.min(end, roadBottomMap);
      if (start >= segEnd) return;

      // Sidewalk
      g.rect(
        x - FULL_SIDEWALK,
        start,
        ROAD_WIDTH + SIDEWALK_W * 2,
        segEnd - start,
      );
      g.fill({ color: t(0x9e9e9e) });

      g.setStrokeStyle({ color: t(0x777777), width: 1, alpha: 0.6 });
      g.moveTo(x - FULL_SIDEWALK, start).lineTo(x - FULL_SIDEWALK, segEnd);
      g.moveTo(x + FULL_SIDEWALK, start).lineTo(x + FULL_SIDEWALK, segEnd);
      g.stroke();

      // Asphalt
      g.rect(x - HALF, start, ROAD_WIDTH, segEnd - start);
      g.fill({ color: t(0x3a3a3a) });

      // Lane lines
      g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
      g.moveTo(x - HALF + 3, start).lineTo(x - HALF + 3, segEnd);
      g.moveTo(x + HALF - 3, start).lineTo(x + HALF - 3, segEnd);
      g.stroke();

      // Center dashes
      for (let dy = start; dy < segEnd; dy += 28) {
        g.rect(x - 1.5, dy, 3, 14);
        g.fill({ color: 0xe8b930, alpha: 0.85 });
      }
    };

    for (let y = 0; y < MAP_SIZE; y += ROAD_SPACING) {
      // Check if either side of the road line allows roads
      const zLeft = getZoneAt(x - 1, y + ROAD_SPACING / 2);
      const zRight = getZoneAt(x + 1, y + ROAD_SPACING / 2);
      const hasRoads = ZONES[zLeft].hasRoads || ZONES[zRight].hasRoads;

      if (hasRoads) {
        if (segmentStart === -1) segmentStart = y;
      } else {
        if (segmentStart !== -1) {
          drawSegment(segmentStart, y);
          segmentStart = -1;
        }
      }
    }

    if (segmentStart !== -1) {
      drawSegment(segmentStart, MAP_SIZE);
    }
  }
}

function drawIntersections(g: Graphics, t: TintFn): void {
  const stripeW = 5;
  const stripeGap = 9;

  for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
    for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
      if (iy - HALF > WATER_LINE_Y) continue;

      // An intersection exists if both horizontal and vertical roads connect here
      const hasH =
        ZONES[getZoneAt(ix, iy - 1)].hasRoads ||
        ZONES[getZoneAt(ix, iy + 1)].hasRoads;
      const hasV =
        ZONES[getZoneAt(ix - 1, iy)].hasRoads ||
        ZONES[getZoneAt(ix + 1, iy)].hasRoads;
      if (!hasH || !hasV) continue;

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
