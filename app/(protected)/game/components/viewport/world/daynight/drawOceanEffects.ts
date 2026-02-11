// components/game/viewport/world/daynight/drawOceanEffects.ts
import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/map/constants";
import { WATER_LINE_Y } from "@/convex/mapZones";

export function drawOceanEffects(
  g: Graphics,
  overlayAlpha: number,
  streetLightAlpha: number,
) {
  // Extra darkness on ocean at night
  if (overlayAlpha > 0.2) {
    g.rect(0, WATER_LINE_Y, MAP_SIZE, MAP_SIZE - WATER_LINE_Y);
    g.fill({ color: 0x050520, alpha: overlayAlpha * 0.3 });
  }

  // Moon/water reflection on ocean at night
  if (streetLightAlpha > 0.1) {
    const reflectX = MAP_SIZE / 2;
    const reflectY = WATER_LINE_Y + 80;
    // Wide shimmer
    g.ellipse(reflectX, reflectY, 200, 40);
    g.fill({ color: 0xaabbdd, alpha: streetLightAlpha * 0.03 });
    // Narrow shimmer
    g.ellipse(reflectX, reflectY, 80, 15);
    g.fill({ color: 0xccddff, alpha: streetLightAlpha * 0.06 });
  }
}
