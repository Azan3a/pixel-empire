// components/game/viewport/world/daynight/drawParkLamps.ts
import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/mapZones";

export function drawParkLamps(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const parkBounds = ZONES.park.bounds;
  const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
  const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;

  // Lights along the horizontal path
  for (let lx = parkBounds.x1 + 300; lx < parkBounds.x2 - 300; lx += 600) {
    g.circle(lx, parkCY, 35);
    g.fill({ color: 0xffeedd, alpha: streetLightAlpha * 0.04 });
    g.circle(lx, parkCY, 10);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
  }

  // Lights along the vertical path
  for (let ly = parkBounds.y1 + 300; ly < parkBounds.y2 - 300; ly += 600) {
    if (Math.abs(ly - parkCY) < 200) continue; // Skip near center interaction
    g.circle(parkCX, ly, 35);
    g.fill({ color: 0xffeedd, alpha: streetLightAlpha * 0.04 });
    g.circle(parkCX, ly, 10);
    g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
  }
}
