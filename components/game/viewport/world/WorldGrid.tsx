"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";

// Deterministic pseudo-random from coordinates
function seeded(x: number, y: number, i: number): number {
  return (((x + i) * 7919 + (y + i) * 104729 + i * 31) % 1000) / 1000;
}

export function WorldGrid() {
  const drawGrid = useCallback((g: Graphics) => {
    g.clear();

    const half = ROAD_WIDTH / 2;
    const fullSidewalk = half + SIDEWALK_W;

    // ── Grass base ──
    g.rect(0, 0, MAP_SIZE, MAP_SIZE);
    g.fill({ color: 0x4a7a4a });

    g.setStrokeStyle({ color: 0x3d6b3d, width: 1, alpha: 0.35 });
    for (let i = 0; i < MAP_SIZE; i += 18) {
      g.moveTo(i, 0).lineTo(i, MAP_SIZE);
      g.moveTo(0, i).lineTo(MAP_SIZE, i);
    }
    g.stroke();

    // ── Horizontal roads ──
    for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
      g.rect(0, y - fullSidewalk, MAP_SIZE, ROAD_WIDTH + SIDEWALK_W * 2);
      g.fill({ color: 0x9e9e9e });

      g.setStrokeStyle({ color: 0x777777, width: 1, alpha: 0.6 });
      g.moveTo(0, y - fullSidewalk).lineTo(MAP_SIZE, y - fullSidewalk);
      g.moveTo(0, y + fullSidewalk).lineTo(MAP_SIZE, y + fullSidewalk);
      g.stroke();

      g.rect(0, y - half, MAP_SIZE, ROAD_WIDTH);
      g.fill({ color: 0x3a3a3a });

      g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
      g.moveTo(0, y - half + 3).lineTo(MAP_SIZE, y - half + 3);
      g.moveTo(0, y + half - 3).lineTo(MAP_SIZE, y + half - 3);
      g.stroke();

      for (let x = 0; x < MAP_SIZE; x += 28) {
        g.rect(x, y - 1.5, 14, 3);
        g.fill({ color: 0xe8b930, alpha: 0.85 });
      }
    }

    // ── Vertical roads ──
    for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
      g.rect(x - fullSidewalk, 0, ROAD_WIDTH + SIDEWALK_W * 2, MAP_SIZE);
      g.fill({ color: 0x9e9e9e });

      g.setStrokeStyle({ color: 0x777777, width: 1, alpha: 0.6 });
      g.moveTo(x - fullSidewalk, 0).lineTo(x - fullSidewalk, MAP_SIZE);
      g.moveTo(x + fullSidewalk, 0).lineTo(x + fullSidewalk, MAP_SIZE);
      g.stroke();

      g.rect(x - half, 0, ROAD_WIDTH, MAP_SIZE);
      g.fill({ color: 0x3a3a3a });

      g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
      g.moveTo(x - half + 3, 0).lineTo(x - half + 3, MAP_SIZE);
      g.moveTo(x + half - 3, 0).lineTo(x + half - 3, MAP_SIZE);
      g.stroke();

      for (let y = 0; y < MAP_SIZE; y += 28) {
        g.rect(x - 1.5, y, 3, 14);
        g.fill({ color: 0xe8b930, alpha: 0.85 });
      }
    }

    // ── Intersections + crosswalks ──
    for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
      for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
        g.rect(ix - half, iy - half, ROAD_WIDTH, ROAD_WIDTH);
        g.fill({ color: 0x3a3a3a });

        const stripeW = 5;
        const stripeGap = 9;

        for (let s = -half + 6; s < half - 6; s += stripeGap) {
          g.rect(ix + s, iy - fullSidewalk, stripeW, SIDEWALK_W);
          g.fill({ color: 0xffffff, alpha: 0.65 });
        }
        for (let s = -half + 6; s < half - 6; s += stripeGap) {
          g.rect(ix + s, iy + half, stripeW, SIDEWALK_W);
          g.fill({ color: 0xffffff, alpha: 0.65 });
        }
        for (let s = -half + 6; s < half - 6; s += stripeGap) {
          g.rect(ix - fullSidewalk, iy + s, SIDEWALK_W, stripeW);
          g.fill({ color: 0xffffff, alpha: 0.65 });
        }
        for (let s = -half + 6; s < half - 6; s += stripeGap) {
          g.rect(ix + half, iy + s, SIDEWALK_W, stripeW);
          g.fill({ color: 0xffffff, alpha: 0.65 });
        }
      }
    }

    // ── Decorative trees ──
    for (let bx = 0; bx < MAP_SIZE; bx += ROAD_SPACING) {
      for (let by = 0; by < MAP_SIZE; by += ROAD_SPACING) {
        const margin = 50;
        const range = ROAD_SPACING - margin * 2 - SIDEWALK_W * 2;
        if (range <= 0) continue;

        for (let t = 0; t < 4; t++) {
          const tx = bx + margin + seeded(bx, by, t * 3) * range;
          const ty = by + margin + seeded(bx, by, t * 3 + 1) * range;
          const size = 6 + seeded(bx, by, t * 3 + 2) * 6;

          g.ellipse(tx + 3, ty + 3, size, size * 0.7);
          g.fill({ color: 0x1a3a1a, alpha: 0.2 });

          g.circle(tx, ty, size);
          g.fill({ color: 0x2d8a2d, alpha: 0.75 });

          g.circle(tx - 1, ty - 1, size * 0.6);
          g.fill({ color: 0x3ca03c, alpha: 0.5 });

          g.circle(tx, ty, 2);
          g.fill({ color: 0x5c3a1a });
        }
      }
    }

    // ── Street lights ──
    for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
      for (let y = 80; y < MAP_SIZE; y += 120) {
        g.circle(x + fullSidewalk + 4, y, 2);
        g.fill({ color: 0x666666 });
        g.circle(x + fullSidewalk + 4, y, 5);
        g.fill({ color: 0xffee88, alpha: 0.12 });
      }
    }

    // ── Map border ──
    g.setStrokeStyle({ color: 0xffffff, width: 4, alpha: 0.15 });
    g.rect(0, 0, MAP_SIZE, MAP_SIZE);
    g.stroke();
  }, []);

  return <pixiGraphics draw={drawGrid} />;
}
