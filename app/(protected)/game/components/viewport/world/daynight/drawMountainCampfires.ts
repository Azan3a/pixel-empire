// components/game/viewport/world/daynight/drawMountainCampfires.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

/**
 * Draw warm campfire glows scattered across the mountain zone at night.
 * Uses seeded positions to keep them deterministic.
 */
export function drawMountainCampfires(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.05) return;

  const b = ZONES.mountains.bounds;
  const w = b.x2 - b.x1;
  const h = b.y2 - b.y1;

  // 8 campfire positions seeded within mountain bounds
  const seeds = [
    { fx: 0.15, fy: 0.3 },
    { fx: 0.35, fy: 0.55 },
    { fx: 0.55, fy: 0.2 },
    { fx: 0.75, fy: 0.45 },
    { fx: 0.25, fy: 0.75 },
    { fx: 0.6, fy: 0.7 },
    { fx: 0.85, fy: 0.25 },
    { fx: 0.45, fy: 0.85 },
  ];

  for (const seed of seeds) {
    const cx = b.x1 + seed.fx * w;
    const cy = b.y1 + seed.fy * h;

    // Wide warm ambient glow
    g.circle(cx, cy, 60);
    g.fill({ color: 0xff6622, alpha: streetLightAlpha * 0.02 });

    // Medium fire glow
    g.circle(cx, cy, 25);
    g.fill({ color: 0xff8844, alpha: streetLightAlpha * 0.05 });

    // Bright ember center
    g.circle(cx, cy, 8);
    g.fill({ color: 0xffaa44, alpha: streetLightAlpha * 0.12 });

    // Spark point
    g.circle(cx, cy, 3);
    g.fill({ color: 0xffdd88, alpha: streetLightAlpha * 0.2 });
  }
}
