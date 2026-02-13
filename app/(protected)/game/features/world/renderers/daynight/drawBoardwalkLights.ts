import { Graphics } from "pixi.js";
import {
  MAP_SIZE,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
} from "@game/shared/contracts/game-config";

export function drawBoardwalkLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const bwTop = BOARDWALK_Y - BOARDWALK_HEIGHT / 2;
  const bwMid = BOARDWALK_Y;

  for (let lx = 100; lx < MAP_SIZE; lx += 200) {
    g.circle(lx, bwMid, 50);
    g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
    g.circle(lx, bwMid, 20);
    g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });
    g.circle(lx, bwTop + 4, 3);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.6 });
  }
}
