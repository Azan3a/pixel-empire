// components/game/viewport/world/daynight/drawIndustrialFloodlights.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

/**
 * Draw harsh industrial floodlights at factory/warehouse positions.
 * Cool white security-style lighting that's always-on at night.
 */
export function drawIndustrialFloodlights(
  g: Graphics,
  streetLightAlpha: number,
) {
  if (streetLightAlpha <= 0.02) return;

  const b = ZONES.industrial.bounds;
  const w = b.x2 - b.x1;
  const h = b.y2 - b.y1;

  // 6 floodlight towers at factory perimeters
  const towers = [
    { fx: 0.15, fy: 0.2 },
    { fx: 0.5, fy: 0.15 },
    { fx: 0.85, fy: 0.25 },
    { fx: 0.2, fy: 0.75 },
    { fx: 0.6, fy: 0.8 },
    { fx: 0.9, fy: 0.65 },
  ];

  for (const t of towers) {
    const tx = b.x1 + t.fx * w;
    const ty = b.y1 + t.fy * h;

    // Wide security flood
    g.circle(tx, ty, 80);
    g.fill({ color: 0xddeeff, alpha: streetLightAlpha * 0.015 });

    // Focused cone
    g.circle(tx, ty, 35);
    g.fill({ color: 0xeef4ff, alpha: streetLightAlpha * 0.04 });

    // Harsh lamp
    g.circle(tx, ty, 10);
    g.fill({ color: 0xffffff, alpha: streetLightAlpha * 0.12 });

    // Bulb
    g.circle(tx, ty, 3);
    g.fill({ color: 0xffffff, alpha: streetLightAlpha * 0.5 });
  }

  // Faint red warning lights on tall structures (always dim)
  const warnings = [
    { fx: 0.3, fy: 0.4 },
    { fx: 0.7, fy: 0.5 },
  ];

  for (const wr of warnings) {
    const wx = b.x1 + wr.fx * w;
    const wy = b.y1 + wr.fy * h;

    g.circle(wx, wy, 6);
    g.fill({ color: 0xff2222, alpha: streetLightAlpha * 0.15 });
    g.circle(wx, wy, 2);
    g.fill({ color: 0xff4444, alpha: streetLightAlpha * 0.4 });
  }
}
