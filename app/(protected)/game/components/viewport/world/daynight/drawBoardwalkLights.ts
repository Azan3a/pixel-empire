// components/game/viewport/world/daynight/drawBoardwalkLights.ts
import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/gameConstants";
import { BOARDWALK_Y, BOARDWALK_HEIGHT } from "@/convex/mapZones";

export function drawBoardwalkLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const bwTop = BOARDWALK_Y - BOARDWALK_HEIGHT / 2;
  const bwMid = BOARDWALK_Y;

  for (let lx = 100; lx < MAP_SIZE; lx += 200) {
    // Wide ambient glow
    g.circle(lx, bwMid, 50);
    g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
    // Warm center
    g.circle(lx, bwMid, 20);
    g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });
    // Bright bulb
    g.circle(lx, bwTop + 4, 3);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.6 });
  }
}
