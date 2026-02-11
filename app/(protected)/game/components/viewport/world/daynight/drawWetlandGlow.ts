// components/game/viewport/world/daynight/drawWetlandGlow.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

/**
 * Draw ethereal bioluminescent glow spots across the wetland marshes.
 * Appears only at deeper night levels for a magical atmosphere.
 */
export function drawWetlandGlow(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.3) return; // Only at deep night

  const b = ZONES.wetlands.bounds;
  const w = b.x2 - b.x1;
  const h = b.y2 - b.y1;

  // 15 bioluminescent spots — scattered throughout marsh
  for (let i = 0; i < 15; i++) {
    const fx = b.x1 + ((i * 6971 + 43) % w);
    const fy = b.y1 + ((i * 104729 + 23) % h);

    // Wide ethereal haze
    g.circle(fx, fy, 35);
    g.fill({ color: 0x44ffaa, alpha: streetLightAlpha * 0.015 });

    // Inner glow
    g.circle(fx, fy, 12);
    g.fill({ color: 0x66ffcc, alpha: streetLightAlpha * 0.04 });

    // Bright spore
    g.circle(fx, fy, 3);
    g.fill({ color: 0xaaffdd, alpha: streetLightAlpha * 0.1 });
  }

  // 10 firefly-like floating spots (slightly different color)
  for (let i = 0; i < 10; i++) {
    const fx = b.x1 + ((i * 8191 + 71) % w);
    const fy = b.y1 + ((i * 65537 + 37) % h);

    g.circle(fx, fy, 4);
    g.fill({ color: 0xccffaa, alpha: streetLightAlpha * 0.06 });
    g.circle(fx, fy, 1.5);
    g.fill({ color: 0xeeffcc, alpha: streetLightAlpha * 0.12 });
  }
}
