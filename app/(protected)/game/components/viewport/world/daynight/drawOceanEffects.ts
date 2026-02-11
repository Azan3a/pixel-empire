// components/game/viewport/world/daynight/drawOceanEffects.ts
import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/map/constants";

export function drawOceanEffects(
  g: Graphics,
  overlayAlpha: number,
  streetLightAlpha: number,
) {
  // Extra darkness on ocean at night — cover entire map,
  // the island terrain is drawn on top so this only shows on water.
  if (overlayAlpha > 0.2) {
    g.rect(0, 0, MAP_SIZE, MAP_SIZE);
    g.fill({ color: 0x050520, alpha: overlayAlpha * 0.3 });
  }

  // Moon/water reflection on ocean — place south of island center
  if (streetLightAlpha > 0.1) {
    const reflectX = MAP_SIZE / 2;
    const reflectY = MAP_SIZE * 0.85;
    // Wide shimmer
    g.ellipse(reflectX, reflectY, 200, 40);
    g.fill({ color: 0xaabbdd, alpha: streetLightAlpha * 0.03 });
    // Narrow shimmer
    g.ellipse(reflectX, reflectY, 80, 15);
    g.fill({ color: 0xccddff, alpha: streetLightAlpha * 0.06 });
  }
}
