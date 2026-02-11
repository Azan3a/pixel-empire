// components/game/viewport/world/daynight/drawBoardwalkLights.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/map/zones";

export function drawBoardwalkLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const b = ZONES.boardwalk.bounds;
  const bwMidY = (b.y1 + b.y2) / 2;

  for (let lx = b.x1 + 100; lx < b.x2; lx += 200) {
    // Wide ambient glow
    g.circle(lx, bwMidY, 50);
    g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
    // Warm center
    g.circle(lx, bwMidY, 20);
    g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });
    // Bright bulb
    g.circle(lx, b.y1 + 4, 3);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.6 });
  }
}
