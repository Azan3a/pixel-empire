// components/game/viewport/world/daynight/drawFarmPorchLights.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

/**
 * Draw warm porch lights at seeded farmstead positions in the farmland zone.
 * Simulates lanterns hanging on barn porches and farmhouse entries.
 */
export function drawFarmPorchLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.05) return;

  const b = ZONES.farmland.bounds;
  const w = b.x2 - b.x1;
  const h = b.y2 - b.y1;

  // 10 porch light positions seeded within farmland bounds
  const porches = [
    { fx: 0.12, fy: 0.2 },
    { fx: 0.3, fy: 0.15 },
    { fx: 0.55, fy: 0.25 },
    { fx: 0.8, fy: 0.18 },
    { fx: 0.2, fy: 0.5 },
    { fx: 0.45, fy: 0.55 },
    { fx: 0.7, fy: 0.45 },
    { fx: 0.15, fy: 0.8 },
    { fx: 0.5, fy: 0.78 },
    { fx: 0.85, fy: 0.7 },
  ];

  for (const p of porches) {
    const px = b.x1 + p.fx * w;
    const py = b.y1 + p.fy * h;

    // Soft warm porch glow
    g.circle(px, py, 40);
    g.fill({ color: 0xffcc44, alpha: streetLightAlpha * 0.02 });

    // Inner lamp glow
    g.circle(px, py, 15);
    g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.06 });

    // Lamp bulb
    g.circle(px, py, 4);
    g.fill({ color: 0xfff0aa, alpha: streetLightAlpha * 0.35 });
  }
}
