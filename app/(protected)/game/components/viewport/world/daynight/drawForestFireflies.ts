// components/game/viewport/world/daynight/drawForestFireflies.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

export function drawForestFireflies(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.3) return;

  const forestBounds = ZONES.forest.bounds;

  for (let fi = 0; fi < 20; fi++) {
    const fx =
      forestBounds.x1 +
      ((fi * 7919 + 31) % (forestBounds.x2 - forestBounds.x1));
    const fy =
      forestBounds.y1 +
      ((fi * 104729 + 17) % (forestBounds.y2 - forestBounds.y1));
    g.circle(fx, fy, 3);
    g.fill({ color: 0xccffaa, alpha: streetLightAlpha * 0.08 });
    g.circle(fx, fy, 1);
    g.fill({ color: 0xeeffcc, alpha: streetLightAlpha * 0.15 });
  }
}
