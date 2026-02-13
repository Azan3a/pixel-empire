import { Graphics } from "pixi.js";
import { ZONES } from "@game/shared/contracts/game-config";

export function drawParkLamps(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const parkBounds = ZONES.park.bounds;
  const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
  const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;

  for (let lx = parkBounds.x1 + 300; lx < parkBounds.x2 - 300; lx += 600) {
    g.circle(lx, parkCY, 35);
    g.fill({ color: 0xffeedd, alpha: streetLightAlpha * 0.04 });
    g.circle(lx, parkCY, 10);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
  }

  for (let ly = parkBounds.y1 + 300; ly < parkBounds.y2 - 300; ly += 600) {
    if (Math.abs(ly - parkCY) < 200) continue;
    g.circle(parkCX, ly, 35);
    g.fill({ color: 0xffeedd, alpha: streetLightAlpha * 0.04 });
    g.circle(parkCX, ly, 10);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
  }
}
