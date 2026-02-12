// components/game/viewport/world/drawing/drawParkFeatures.ts

import { Graphics } from "pixi.js";
import { ZONES, ZONE_VISUALS } from "@/convex/mapZones";
import type { TintFn } from "../utils/tintFactory";

/**
 * Draw decorative park features: circular paths, gardens, a fountain, and ponds.
 */
export function drawParkFeatures(g: Graphics, t: TintFn): void {
  const b = ZONES.park.bounds;
  const vis = ZONE_VISUALS.park;
  const cx = (b.x1 + b.x2) / 2;
  const cy = (b.y1 + b.y2) / 2;

  // ── Main Paths (Circular & Cross) ──
  // Use a slightly desaturated version of the terrain accent for paths or keep sandy color
  g.setStrokeStyle({ color: t(0xbc9c63), width: 10, alpha: 0.6 });

  // Central circle path
  const radius = 280;
  g.circle(cx, cy, radius);
  g.stroke();

  // Cross paths - extend to bounds with a margin
  const margin = 50;
  g.moveTo(b.x1 + margin, cy).lineTo(cx - radius + 5, cy);
  g.moveTo(cx + radius - 5, cy).lineTo(b.x2 - margin, cy);
  g.moveTo(cx, b.y1 + margin).lineTo(cx, cy - radius + 5);
  g.moveTo(cx, cy + radius - 5).lineTo(cx, b.y2 - margin);
  g.stroke();

  // ── Central Fountain ──
  g.circle(cx, cy, 55);
  g.fill({ color: t(0xbbbbbb) });
  g.circle(cx, cy, 45);
  g.fill({ color: t(0x4a92b2), alpha: 0.8 });
  g.circle(cx, cy, 15);
  g.fill({ color: 0xffffff, alpha: 0.4 });

  // ── Flower Beds ──
  const drawFlowerBed = (fx: number, fy: number, color: number) => {
    g.circle(fx, fy, 40);
    g.fill({ color: t(vis.grassAccent), alpha: 0.8 }); // Follow mapZone colors
    // Petals/flowers
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      g.circle(fx + Math.cos(angle) * 18, fy + Math.sin(angle) * 18, 12);
      g.fill({ color: t(color), alpha: 0.9 });
    }
    g.circle(fx, fy, 10);
    g.fill({ color: t(0xffd700), alpha: 0.8 }); // Yellow center
  };

  drawFlowerBed(cx - 450, cy - 450, 0xff69b4); // Pink
  drawFlowerBed(cx + 450, cy - 450, 0xba55d3); // Purple
  drawFlowerBed(cx - 450, cy + 450, 0xff4500); // Red-Orange
  drawFlowerBed(cx + 450, cy + 450, 0x1e90ff); // Blue

  // ── Benches ──
  const drawBench = (bx: number, by: number, _rotation: number) => {
    const bw = 50;
    const bh = 14;
    g.setStrokeStyle({ color: t(0x4a3a2a), width: 2 });
    g.rect(bx - bw / 2, by - bh / 2, bw, bh);
    g.fill({ color: t(0x6a4a3a) });
    g.stroke();
  };

  // Benches around the circle
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4 + Math.PI / 4;
    const bx = cx + Math.cos(angle) * (radius + 40);
    const by = cy + Math.sin(angle) * (radius + 40);
    drawBench(bx, by, angle);
  }

  // ── Ponds ──
  const drawPond = (px: number, py: number, rw: number, rh: number) => {
    g.ellipse(px, py, rw, rh);
    g.fill({ color: t(0x3a8aaa), alpha: 0.5 });
    g.setStrokeStyle({ color: t(0x2a7a9a), width: 3, alpha: 0.3 });
    g.ellipse(px, py, rw, rh);
    g.stroke();
    // Lily pads
    g.circle(px - rw * 0.3, py + rh * 0.2, 10);
    g.fill({ color: t(0x2d8a2d), alpha: 0.6 });
  };

  drawPond(cx + 420, cy - 100, 110, 70);
  drawPond(cx - 380, cy + 280, 90, 60);
}
