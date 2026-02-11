// components/game/viewport/world/daynight/drawHarborLights.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

/**
 * Draw dock lights and a rotating-style lighthouse beam at the harbor.
 */
export function drawHarborLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const b = ZONES.harbor.bounds;

  // ── Dock lights along the waterfront (right edge of harbor) ──
  for (let ly = b.y1 + 80; ly < b.y2; ly += 160) {
    const dx = b.x2 - 40;

    // Wide dock glow (cooler white)
    g.circle(dx, ly, 45);
    g.fill({ color: 0xccddff, alpha: streetLightAlpha * 0.025 });

    // Inner glow
    g.circle(dx, ly, 18);
    g.fill({ color: 0xddeeff, alpha: streetLightAlpha * 0.07 });

    // Bulb
    g.circle(dx, ly, 5);
    g.fill({ color: 0xeef4ff, alpha: streetLightAlpha * 0.4 });
  }

  // ── Warehouse loading lights (top edge) ──
  for (let lx = b.x1 + 200; lx < b.x2 - 200; lx += 300) {
    g.circle(lx, b.y1 + 60, 55);
    g.fill({ color: 0xffeecc, alpha: streetLightAlpha * 0.02 });
    g.circle(lx, b.y1 + 60, 20);
    g.fill({ color: 0xfff4dd, alpha: streetLightAlpha * 0.06 });
  }

  // ── Lighthouse glow (top-right corner) ──
  const lhX = b.x2 - 80;
  const lhY = b.y1 + 80;

  // Broad lighthouse sweep
  g.circle(lhX, lhY, 100);
  g.fill({ color: 0xffffee, alpha: streetLightAlpha * 0.015 });

  // Focused beam
  g.circle(lhX, lhY, 40);
  g.fill({ color: 0xffffff, alpha: streetLightAlpha * 0.04 });

  // Lighthouse lamp
  g.circle(lhX, lhY, 8);
  g.fill({ color: 0xffffff, alpha: streetLightAlpha * 0.5 });
}
