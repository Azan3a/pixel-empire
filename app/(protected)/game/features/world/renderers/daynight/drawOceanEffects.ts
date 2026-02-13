import { Graphics } from "pixi.js";
import { MAP_SIZE, WATER_LINE_Y } from "@game/shared/contracts/game-config";

export function drawOceanEffects(
  g: Graphics,
  overlayAlpha: number,
  streetLightAlpha: number,
) {
  if (overlayAlpha > 0.2) {
    g.rect(0, WATER_LINE_Y, MAP_SIZE, MAP_SIZE - WATER_LINE_Y);
    g.fill({ color: 0x050520, alpha: overlayAlpha * 0.3 });
  }

  if (streetLightAlpha > 0.1) {
    const reflectX = MAP_SIZE / 2;
    const reflectY = WATER_LINE_Y + 80;
    g.ellipse(reflectX, reflectY, 200, 40);
    g.fill({ color: 0xaabbdd, alpha: streetLightAlpha * 0.03 });
    g.ellipse(reflectX, reflectY, 80, 15);
    g.fill({ color: 0xccddff, alpha: streetLightAlpha * 0.06 });
  }
}
