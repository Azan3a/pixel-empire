// components/game/viewport/world/WorldGrid.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";
import {
  ZONES,
  ZONE_VISUALS,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
  getZoneAt,
} from "@/convex/mapZones";

function seeded(x: number, y: number, i: number): number {
  return (((x + i) * 7919 + (y + i) * 104729 + i * 31) % 1000) / 1000;
}

interface WorldGridProps {
  tintR?: number;
  tintG?: number;
  tintB?: number;
}

function tintColor(color: number, r: number, g: number, b: number): number {
  const cr = Math.round(((color >> 16) & 0xff) * r);
  const cg = Math.round(((color >> 8) & 0xff) * g);
  const cb = Math.round((color & 0xff) * b);
  return (
    (Math.min(255, cr) << 16) | (Math.min(255, cg) << 8) | Math.min(255, cb)
  );
}

function isOnRoad(px: number, py: number): boolean {
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

function WorldGridInner({ tintR = 1, tintG = 1, tintB = 1 }: WorldGridProps) {
  const drawGrid = useCallback(
    (g: Graphics) => {
      g.clear();

      const half = ROAD_WIDTH / 2;
      const fullSidewalk = half + SIDEWALK_W;

      const t = (c: number) => tintColor(c, tintR, tintG, tintB);

      // ── Zone-based terrain fill ──
      // Paint each zone's ground color in blocks
      const zoneBlockSize = 50; // resolution for zone painting
      for (let bx = 0; bx < MAP_SIZE; bx += zoneBlockSize) {
        for (let by = 0; by < MAP_SIZE; by += zoneBlockSize) {
          const zoneId = getZoneAt(
            bx + zoneBlockSize / 2,
            by + zoneBlockSize / 2,
          );
          const vis = ZONE_VISUALS[zoneId];
          g.rect(bx, by, zoneBlockSize, zoneBlockSize);
          g.fill({ color: t(vis.grassColor) });
        }
      }

      // ── Zone grid textures ──
      // Subtle grid lines per zone
      for (let bx = 0; bx < MAP_SIZE; bx += zoneBlockSize) {
        for (let by = 0; by < MAP_SIZE; by += zoneBlockSize) {
          const zoneId = getZoneAt(
            bx + zoneBlockSize / 2,
            by + zoneBlockSize / 2,
          );
          const vis = ZONE_VISUALS[zoneId];
          g.setStrokeStyle({
            color: t(vis.grassAccent),
            width: 1,
            alpha: 0.25,
          });
          // Vertical lines within this block
          for (let lx = bx; lx < bx + zoneBlockSize; lx += 18) {
            g.moveTo(lx, by).lineTo(lx, by + zoneBlockSize);
          }
          // Horizontal lines within this block
          for (let ly = by; ly < by + zoneBlockSize; ly += 18) {
            g.moveTo(bx, ly).lineTo(bx + zoneBlockSize, ly);
          }
          g.stroke();
        }
      }

      // ── Beach sand gradient ──
      const beachBounds = ZONES.beach.bounds;
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
      g.moveTo(0, bwY + BOARDWALK_HEIGHT).lineTo(
        MAP_SIZE,
        bwY + BOARDWALK_HEIGHT,
      );
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

      // ── Park features ──
      const parkBounds = ZONES.park.bounds;
      // Paths through the park
      g.setStrokeStyle({ color: t(0xc4a473), width: 8, alpha: 0.5 });
      const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
      const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;
      // Horizontal path
      g.moveTo(parkBounds.x1 + 40, parkCY).lineTo(parkBounds.x2 - 40, parkCY);
      g.stroke();
      // Vertical path
      g.moveTo(parkCX, parkBounds.y1 + 40).lineTo(parkCX, parkBounds.y2 - 40);
      g.stroke();
      // Diagonal paths
      g.moveTo(parkBounds.x1 + 80, parkBounds.y1 + 80).lineTo(
        parkBounds.x2 - 80,
        parkBounds.y2 - 80,
      );
      g.moveTo(parkBounds.x2 - 80, parkBounds.y1 + 80).lineTo(
        parkBounds.x1 + 80,
        parkBounds.y2 - 80,
      );
      g.stroke();

      // Pond
      const pondX = parkCX + 120;
      const pondY = parkCY - 100;
      g.ellipse(pondX, pondY, 80, 50);
      g.fill({ color: t(0x3a8aaa), alpha: 0.6 });
      g.setStrokeStyle({ color: t(0x2a7a9a), width: 2, alpha: 0.4 });
      g.ellipse(pondX, pondY, 80, 50);
      g.stroke();
      // Pond highlight
      g.ellipse(pondX - 20, pondY - 12, 30, 18);
      g.fill({ color: 0xffffff, alpha: 0.08 });

      // ── Horizontal roads ──
      for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
        // Skip roads in ocean
        if (y - fullSidewalk > WATER_LINE_Y) continue;

        const roadBottom = Math.min(y + fullSidewalk, WATER_LINE_Y);
        const roadH = roadBottom - (y - fullSidewalk);

        g.rect(0, y - fullSidewalk, MAP_SIZE, roadH);
        g.fill({ color: t(0x9e9e9e) });

        g.setStrokeStyle({ color: t(0x777777), width: 1, alpha: 0.6 });
        g.moveTo(0, y - fullSidewalk).lineTo(MAP_SIZE, y - fullSidewalk);
        if (roadBottom === y + fullSidewalk) {
          g.moveTo(0, y + fullSidewalk).lineTo(MAP_SIZE, y + fullSidewalk);
        }
        g.stroke();

        const asphaltBottom = Math.min(y + half, WATER_LINE_Y);
        g.rect(0, y - half, MAP_SIZE, asphaltBottom - (y - half));
        g.fill({ color: t(0x3a3a3a) });

        g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
        g.moveTo(0, y - half + 3).lineTo(MAP_SIZE, y - half + 3);
        if (asphaltBottom === y + half) {
          g.moveTo(0, y + half - 3).lineTo(MAP_SIZE, y + half - 3);
        }
        g.stroke();

        for (let x = 0; x < MAP_SIZE; x += 28) {
          if (y - 1.5 < WATER_LINE_Y) {
            g.rect(x, y - 1.5, 14, 3);
            g.fill({ color: 0xe8b930, alpha: 0.85 });
          }
        }
      }

      // ── Vertical roads ──
      for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
        const roadBottom = Math.min(MAP_SIZE, WATER_LINE_Y);

        g.rect(x - fullSidewalk, 0, ROAD_WIDTH + SIDEWALK_W * 2, roadBottom);
        g.fill({ color: t(0x9e9e9e) });

        g.setStrokeStyle({ color: t(0x777777), width: 1, alpha: 0.6 });
        g.moveTo(x - fullSidewalk, 0).lineTo(x - fullSidewalk, roadBottom);
        g.moveTo(x + fullSidewalk, 0).lineTo(x + fullSidewalk, roadBottom);
        g.stroke();

        g.rect(x - half, 0, ROAD_WIDTH, roadBottom);
        g.fill({ color: t(0x3a3a3a) });

        g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.3 });
        g.moveTo(x - half + 3, 0).lineTo(x - half + 3, roadBottom);
        g.moveTo(x + half - 3, 0).lineTo(x + half - 3, roadBottom);
        g.stroke();

        for (let y = 0; y < roadBottom; y += 28) {
          g.rect(x - 1.5, y, 3, 14);
          g.fill({ color: 0xe8b930, alpha: 0.85 });
        }
      }

      // ── Intersections + crosswalks ──
      for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
        for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
          if (iy - half > WATER_LINE_Y) continue;

          g.rect(ix - half, iy - half, ROAD_WIDTH, ROAD_WIDTH);
          g.fill({ color: t(0x3a3a3a) });

          const stripeW = 5;
          const stripeGap = 9;

          // Top crosswalk
          if (iy - fullSidewalk >= 0) {
            for (let s = -half + 6; s < half - 6; s += stripeGap) {
              g.rect(ix + s, iy - fullSidewalk, stripeW, SIDEWALK_W);
              g.fill({ color: 0xffffff, alpha: 0.65 });
            }
          }
          // Bottom crosswalk
          if (iy + half < WATER_LINE_Y) {
            for (let s = -half + 6; s < half - 6; s += stripeGap) {
              g.rect(ix + s, iy + half, stripeW, SIDEWALK_W);
              g.fill({ color: 0xffffff, alpha: 0.65 });
            }
          }
          // Left crosswalk
          for (let s = -half + 6; s < half - 6; s += stripeGap) {
            g.rect(ix - fullSidewalk, iy + s, SIDEWALK_W, stripeW);
            g.fill({ color: 0xffffff, alpha: 0.65 });
          }
          // Right crosswalk
          for (let s = -half + 6; s < half - 6; s += stripeGap) {
            g.rect(ix + half, iy + s, SIDEWALK_W, stripeW);
            g.fill({ color: 0xffffff, alpha: 0.65 });
          }
        }
      }

      // ── Decorative trees (zone-aware) ──
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

            // Tree colors vary by zone
            const trunkColor = zoneId === "beach" ? 0x8b6b4a : 0x5c3a1a;
            const canopyDark =
              zoneId === "forest"
                ? 0x1a4a1a
                : zoneId === "park"
                  ? 0x2a7a2a
                  : 0x2d8a2d;
            const canopyLight =
              zoneId === "forest"
                ? 0x2a6a2a
                : zoneId === "park"
                  ? 0x3aa03a
                  : 0x3ca03c;

            // Palm trees on beach
            if (zoneId === "beach") {
              // Trunk
              g.setStrokeStyle({ color: t(trunkColor), width: 3, alpha: 0.8 });
              g.moveTo(tx, ty + size).lineTo(tx + 2, ty - size * 0.5);
              g.stroke();
              // Fronds
              g.ellipse(tx + 2, ty - size * 0.6, size * 1.2, size * 0.5);
              g.fill({ color: t(0x3a8a3a), alpha: 0.7 });
            } else {
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
          }
        }
      }

      // ── Map border ──
      g.setStrokeStyle({ color: 0xffffff, width: 4, alpha: 0.15 });
      g.rect(0, 0, MAP_SIZE, MAP_SIZE);
      g.stroke();
    },
    [tintR, tintG, tintB],
  );

  return <pixiGraphics draw={drawGrid} />;
}

/** Lerp between two hex colors */
function lerpColor(c1: number, c2: number, t: number): number {
  const r1 = (c1 >> 16) & 0xff,
    g1 = (c1 >> 8) & 0xff,
    b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff,
    g2 = (c2 >> 8) & 0xff,
    b2 = c2 & 0xff;
  const clamp = Math.max(0, Math.min(1, t));
  const r = Math.round(r1 + (r2 - r1) * clamp);
  const g = Math.round(g1 + (g2 - g1) * clamp);
  const b = Math.round(b1 + (b2 - b1) * clamp);
  return (r << 16) | (g << 8) | b;
}

export const WorldGrid = memo(WorldGridInner);
